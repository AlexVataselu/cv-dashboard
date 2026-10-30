import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Vercel runs this as the project's ignoreCommand (vercel.json):
// exit 0 skips the build, exit 1 lets it run.

export const BOT_LOGIN = "github-actions[bot]";
export const BOT_EMAIL = "41898282+github-actions[bot]@users.noreply.github.com";

/**
 * The Lighthouse workflow commits refreshed audit data to main as github-actions[bot].
 * Deploying that commit would trigger another audit and another commit, so it is skipped,
 * as is any push that only touches data/.
 * @param {{ authorLogin?: string, authorEmail?: string, changedFiles: string[] | null }} commit
 * @returns {string | null} why the build is skipped, or null to build
 */
export function skipReason({ authorLogin, authorEmail, changedFiles }) {
  if (authorLogin === BOT_LOGIN || authorEmail === BOT_EMAIL) return `commit by ${BOT_LOGIN}`;
  if (changedFiles && changedFiles.length > 0 && changedFiles.every((f) => f.startsWith("data/"))) {
    return "only data/ changed";
  }
  return null;
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

/** Files changed since the last deployed commit, or since the parent; null when unknown. */
function changedFiles(previousSha) {
  for (const base of [previousSha, "HEAD^"]) {
    if (!base) continue;
    try {
      return git("diff", "--name-only", base, "HEAD").split("\n").filter(Boolean);
    } catch {
      // Not in the shallow clone (or no parent): try the next base.
    }
  }
  return null;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let authorEmail;
  try {
    authorEmail = git("log", "-1", "--format=%ae");
  } catch {
    authorEmail = undefined;
  }
  const reason = skipReason({
    authorLogin: process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN,
    authorEmail,
    changedFiles: changedFiles(process.env.VERCEL_GIT_PREVIOUS_SHA),
  });
  console.log(reason ? `Skipping build: ${reason}.` : "Building.");
  process.exit(reason ? 0 : 1);
}

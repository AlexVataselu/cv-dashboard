import { describe, expect, it } from "vitest";
import { BOT_EMAIL, BOT_LOGIN, skipReason } from "./vercel-ignore-build.mjs";

describe("vercel-ignore-build", () => {
  it("skips commits made by github-actions[bot]", () => {
    expect(skipReason({ authorLogin: BOT_LOGIN, changedFiles: ["src/app/page.tsx"] })).not.toBeNull();
    expect(skipReason({ authorEmail: BOT_EMAIL, changedFiles: null })).not.toBeNull();
  });
  it("skips pushes that only change data/", () => {
    expect(
      skipReason({ authorLogin: "AlexVataselu", changedFiles: ["data/last-audit.json", "data/build-stats.json"] }),
    ).toBe("only data/ changed");
  });
  it("builds anything else, including when the changed files are unknown", () => {
    expect(skipReason({ authorLogin: "AlexVataselu", changedFiles: ["data/x.json", "src/a.ts"] })).toBeNull();
    expect(skipReason({ authorLogin: "AlexVataselu", changedFiles: [] })).toBeNull();
    expect(skipReason({ authorLogin: "AlexVataselu", changedFiles: null })).toBeNull();
  });
});

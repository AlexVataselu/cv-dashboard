import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { measureFirstLoadJsKb, writeBuildStats } from "./measure-bundle.mjs";

function fixture() {
  const out = mkdtempSync(join(tmpdir(), "measure-"));
  mkdirSync(join(out, "_next", "static", "chunks"), { recursive: true });
  const a = "const a = " + JSON.stringify("x".repeat(50) + Math.random()).repeat(400);
  const b = Array.from({ length: 3000 }, (_, i) => `f${i}(${Math.random()})`).join(";");
  writeFileSync(join(out, "_next/static/chunks/a.js"), a);
  writeFileSync(join(out, "_next/static/chunks/b.js"), b);
  writeFileSync(join(out, "_next/static/chunks/unused.js"), b + b);
  writeFileSync(
    join(out, "index.html"),
    `<html><head><script src="/_next/static/chunks/a.js?dpl=1" async=""></script></head>
<body><script src="/_next/static/chunks/b.js" async=""></script><script src="/_next/static/chunks/a.js" async=""></script><script src="/_next/static/chunks/unused.js" noModule=""></script></body></html>`,
  );
  return { out, expected: (gzipSync(a).length + gzipSync(b).length) / 1024 };
}

describe("measure-bundle", () => {
  it("sums gzipped size of the distinct scripts referenced by index.html, ignoring nomodule polyfills", () => {
    const { out, expected } = fixture();
    const kb = measureFirstLoadJsKb(out);
    expect(kb).toBeGreaterThan(0);
    expect(kb).toBeCloseTo(expected, 1);
  });

  it("writes data/build-stats.json as { firstLoadJsKb: number }", () => {
    const { out } = fixture();
    const target = join(out, "stats.json");
    writeBuildStats(out, target);
    const parsed = JSON.parse(readFileSync(target, "utf8"));
    expect(typeof parsed.firstLoadJsKb).toBe("number");
    expect(parsed.firstLoadJsKb).toBeGreaterThan(0);
  });
});

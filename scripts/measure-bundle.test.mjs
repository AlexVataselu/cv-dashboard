import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  ROUTES,
  budgetViolation,
  budgetViolations,
  measureFirstLoadJsKb,
  measureRoutes,
  writeBuildStats,
} from "./measure-bundle.mjs";

function fixture() {
  const out = mkdtempSync(join(tmpdir(), "measure-"));
  mkdirSync(join(out, "_next", "static", "chunks"), { recursive: true });
  const a = "const a = " + JSON.stringify("x".repeat(50) + Math.random()).repeat(400);
  const b = Array.from({ length: 3000 }, (_, i) => `f${i}(${Math.random()})`).join(";");
  const c = Array.from({ length: 2000 }, (_, i) => `g${i}(${Math.random()})`).join(";");
  writeFileSync(join(out, "_next/static/chunks/a.js"), a);
  writeFileSync(join(out, "_next/static/chunks/b.js"), b);
  writeFileSync(join(out, "_next/static/chunks/c.js"), c);
  writeFileSync(join(out, "_next/static/chunks/unused.js"), b + b);
  writeFileSync(
    join(out, "index.html"),
    `<html><head><script src="/_next/static/chunks/a.js?dpl=1" async=""></script></head>
<body><script src="/_next/static/chunks/b.js" async=""></script><script src="/_next/static/chunks/a.js" async=""></script><script src="/_next/static/chunks/unused.js" noModule=""></script></body></html>`,
  );
  // A heavier route: the same shared chunks plus one of its own.
  writeFileSync(
    join(out, "projects.html"),
    `<html><head><script src="/_next/static/chunks/a.js" async=""></script></head>
<body><script src="/_next/static/chunks/b.js" async=""></script><script src="/_next/static/chunks/c.js" async=""></script></body></html>`,
  );
  const gz = (s) => gzipSync(s).length / 1024;
  return {
    out,
    routes: { "/": "index.html", "/projects": "projects.html" },
    home: gz(a) + gz(b),
    projects: gz(a) + gz(b) + gz(c),
  };
}

describe("measure-bundle", () => {
  it("sums gzipped size of the distinct scripts referenced by index.html, ignoring nomodule polyfills", () => {
    const { out, home } = fixture();
    const kb = measureFirstLoadJsKb(out);
    expect(kb).toBeGreaterThan(0);
    expect(kb).toBeCloseTo(home, 1);
  });

  it("measures each route from its own HTML file", () => {
    const { out, routes, home, projects } = fixture();
    const byRoute = measureRoutes(out, routes);
    expect(byRoute["/"]).toBeCloseTo(home, 1);
    expect(byRoute["/projects"]).toBeCloseTo(projects, 1);
    expect(byRoute["/projects"]).toBeGreaterThan(byRoute["/"]);
  });

  it("covers all five routes of the site", () => {
    expect(Object.keys(ROUTES)).toEqual(["/", "/experience", "/skills", "/projects", "/education"]);
  });

  it("writes data/build-stats.json with the heaviest route as firstLoadJsKb and every route", () => {
    const { out, routes } = fixture();
    const target = join(out, "stats.json");
    writeBuildStats(out, target, routes);
    const parsed = JSON.parse(readFileSync(target, "utf8"));
    expect(typeof parsed.firstLoadJsKb).toBe("number");
    expect(Object.keys(parsed.firstLoadJsKbByRoute)).toEqual(["/", "/projects"]);
    expect(parsed.firstLoadJsKb).toBe(Math.max(...Object.values(parsed.firstLoadJsKbByRoute)));
    expect(parsed.firstLoadJsKb).toBe(parsed.firstLoadJsKbByRoute["/projects"]);
  });

  it("flags a first-load size over the 150 KB budget and accepts one at or under it", () => {
    expect(budgetViolation(150.1)).toMatch(/150 KB budget/);
    expect(budgetViolation(150)).toBeNull();
    expect(budgetViolation(145.1)).toBeNull();
  });

  it("flags every route over budget by name, even when the home route is within it", () => {
    const v = budgetViolations({ "/": 147.9, "/experience": 149.6, "/projects": 150.1 });
    expect(v).toHaveLength(1);
    expect(v[0]).toMatch(/on \/projects: 150\.1 KB/);
    expect(budgetViolations({ "/": 150, "/projects": 149 })).toEqual([]);
  });
});

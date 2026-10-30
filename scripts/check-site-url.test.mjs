import { describe, expect, it } from "vitest";
import { siteUrlViolation } from "./check-site-url.mjs";

describe("check-site-url", () => {
  it("fails a production build without NEXT_PUBLIC_SITE_URL", () => {
    expect(siteUrlViolation({ VERCEL_ENV: "production" })).toMatch(/NEXT_PUBLIC_SITE_URL/);
    expect(siteUrlViolation({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: " " })).not.toBeNull();
  });
  it("passes a production build with the URL set", () => {
    expect(siteUrlViolation({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://x.vercel.app" })).toBeNull();
  });
  it("lets local, CI and preview builds work without it", () => {
    expect(siteUrlViolation({})).toBeNull();
    expect(siteUrlViolation({ CI: "true" })).toBeNull();
    expect(siteUrlViolation({ VERCEL_ENV: "preview" })).toBeNull();
  });
});

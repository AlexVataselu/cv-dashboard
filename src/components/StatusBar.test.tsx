import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Cb = (m: { value: number }) => void;
type Opts = { reportAllChanges?: boolean } | undefined;
const { handlers, options, register } = vi.hoisted(() => {
  const handlers: Record<string, Cb> = {};
  const options: Record<string, Opts> = {};
  const register = (k: string) => (cb: Cb, opts?: Opts) => {
    handlers[k] = cb;
    options[k] = opts;
  };
  return { handlers, options, register };
});
vi.mock("web-vitals", () => ({
  onLCP: register("lcp"),
  onCLS: register("cls"),
  onINP: register("inp"),
}));

import { StatusBar } from "./StatusBar";

describe("StatusBar", () => {
  beforeEach(() => {
    for (const k of Object.keys(handlers)) delete handlers[k];
  });

  it("shows audit pending when the audit date is null", () => {
    render(<StatusBar audit={{ date: null, scores: null }} jsKb={92.4} />);
    expect(screen.getByText("audit pending")).toBeTruthy();
  });

  it("shows the last audit date and scores", () => {
    render(
      <StatusBar
        audit={{
          date: "2026-11-02",
          scores: { performance: 100, accessibility: 100, bestPractices: 100, seo: 100 },
        }}
        jsKb={92.4}
      />,
    );
    expect(screen.getByText("last audit 2026-11-02 · 100/100/100/100")).toBeTruthy();
  });

  it("shows the measured JS size rounded to whole KB", () => {
    render(<StatusBar audit={{ date: null, scores: null }} jsKb={92.4} />);
    expect(screen.getByText("JS ~92 KB")).toBeTruthy();
  });

  it("shows placeholders until vitals arrive, then formatted values", () => {
    render(<StatusBar audit={{ date: null, scores: null }} jsKb={92.4} />);
    expect(screen.getByLabelText("LCP").textContent).toBe("LCP –");
    act(() => {
      handlers.lcp({ value: 800 });
      handlers.cls({ value: 0 });
      handlers.inp({ value: 40.4 });
    });
    expect(screen.getByLabelText("LCP").textContent).toBe("LCP 0.8s");
    expect(screen.getByLabelText("CLS").textContent).toBe("CLS 0.00");
    expect(screen.getByLabelText("INP").textContent).toBe("INP 40ms");
  });

  it("asks web-vitals for every change, so passive visitors see values", () => {
    render(<StatusBar audit={{ date: null, scores: null }} jsKb={92.4} />);
    for (const k of ["lcp", "cls", "inp"]) expect(options[k]).toEqual({ reportAllChanges: true });
  });
});

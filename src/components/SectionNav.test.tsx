import { render, screen, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SECTIONS } from "@/lib/sections";
import { useUiStore } from "@/state/uiStore";
import { SectionNav } from "./SectionNav";

const initial = useUiStore.getState();
beforeEach(() => useUiStore.setState(initial, true));

describe("SectionNav", () => {
  it("renders 5 links in SECTIONS order with aria-current only on current", () => {
    render(<SectionNav current="skills" />);
    const nav = screen.getByRole("navigation", { name: "Sections" });
    const links = Array.from(nav.querySelectorAll("a"));
    expect(links.map((a) => a.textContent)).toEqual(SECTIONS.map((s) => s.label));
    expect(links.map((a) => a.getAttribute("href"))).toEqual(SECTIONS.map((s) => s.href));
    const current = links.filter((a) => a.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toBe("Skills");
  });

  it("carries the selected skill onto hrefs", () => {
    render(<SectionNav current="overview" />);
    act(() => useUiStore.getState().selectSkill("react"));
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(SECTIONS.map((s) => `${s.href}?skill=react`));
  });
});

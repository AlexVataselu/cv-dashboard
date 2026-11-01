import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cv } from "@/content/cv";
import { useUiStore } from "@/state/uiStore";
import Home from "./page";
import EducationPage from "./education/page";
import ExperiencePage from "./experience/page";
import ProjectsPage from "./projects/page";
import SkillsPage from "./skills/page";

const initial = useUiStore.getState();
beforeEach(() => useUiStore.setState(initial, true));

describe("Overview", () => {
  it("has exactly one h1 and renders glance, impact, about and skills by first dated use", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    for (const g of cv.glance) {
      expect(screen.getByText(g.value, { selector: "p" , exact: true })).toBeTruthy();
      expect(screen.getByText(g.label)).toBeTruthy();
    }
    for (const i of cv.impact) {
      expect(screen.getByText(i.label)).toBeTruthy();
      expect(screen.getAllByText(i.source).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(cv.about)).toBeTruthy();
    const react = screen.getByRole("button", { name: /^React ·/ });
    expect(react.textContent).toBe("React · since 2021 · 5 yrs");
    expect(screen.getByRole("button", { name: "Jest" }).textContent).toBe("Jest");
  });

  it("shows skills as text only: no bar, gauge or width, so nothing reads as a rating", () => {
    render(<Home />);
    const card = screen.getByRole("region", { name: "Skills, by first dated use" });
    for (const chip of within(card).getAllByRole("button")) {
      expect(chip.querySelectorAll("[style]")).toHaveLength(0);
      expect(chip.children.length).toBeLessThanOrEqual(2);
    }
  });
});

describe("Experience", () => {
  it("lists roles newest first then the Before 2017 line, using details/summary", () => {
    const { container } = render(<ExperiencePage />);
    const details = Array.from(container.querySelectorAll("details"));
    expect(details).toHaveLength(5);
    expect(details.every((d) => d.querySelector("summary"))).toBe(true);
    const text = details.map((d) => d.querySelector("summary")!.textContent ?? "");
    expect(text[0]).toContain("Freelance, self-employed");
    expect(text[1]).toContain("Pentalog");
    expect(text[2]).toContain("TryAngle Labs");
    expect(text[3]).toContain("healthcare, fintech");
    expect(text[4]).toContain("L.H.EL");
    expect(screen.getByText(cv.before2017, { exact: false })).toBeTruthy();
    expect(screen.getByText(/Before 2017/)).toBeTruthy();
  });

  it("opens only the default role initially and follows expandedRoleId", async () => {
    const { container } = render(<ExperiencePage />);
    const open = () =>
      Array.from(container.querySelectorAll("details")).map((d) => d.open);
    expect(open()).toEqual([true, false, false, false, false]);
    const summaries = container.querySelectorAll("summary");
    await userEvent.click(summaries[1]);
    expect(useUiStore.getState().expandedRoleId).toBe("pentalog");
    expect(open()).toEqual([false, true, false, false, false]);
    await userEvent.click(summaries[1]);
    expect(useUiStore.getState().expandedRoleId).toBeNull();
    expect(open()).toEqual([false, false, false, false, false]);
  });
});

describe("Skills", () => {
  it("groups skills under five headings with pressable chips", async () => {
    render(<SkillsPage />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      "Skills by the year they first appear on the CV",
      "Which skills, when",
      "Frontend",
      "State & data",
      "Backend",
      "Testing & quality",
      "Tooling",
    ]);
    const chip = screen.getByRole("button", { name: /^React ·/ });
    expect(chip.getAttribute("aria-pressed")).toBe("false");
    await userEvent.click(chip);
    expect(useUiStore.getState().selectedSkill).toBe("react");
    expect(chip.getAttribute("aria-pressed")).toBe("true");
    expect(chip.getAttribute("data-highlight")).toBe("true");
    await userEvent.click(chip);
    expect(useUiStore.getState().selectedSkill).toBeNull();
    expect(chip.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("Projects", () => {
  it("lists the three projects with their labels", () => {
    render(<ProjectsPage />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.querySelector("p")!.textContent)).toEqual([
      "2026",
      "2026",
      "Since 2024",
    ]);
    expect(within(cards[0]).getByText(/Stremio Skip Intro/)).toBeTruthy();
    expect(within(cards[1]).getByText(/Powderino/)).toBeTruthy();
    expect(within(cards[2]).getByText(/ReAMP/)).toBeTruthy();
  });
});

describe("Education", () => {
  it("shows both degrees and languages with no years", () => {
    const { container } = render(<EducationPage />);
    for (const e of cv.education) expect(screen.getByText(e.degree)).toBeTruthy();
    for (const l of cv.languages) {
      expect(screen.getByText(l.name)).toBeTruthy();
      expect(screen.getByText(l.level)).toBeTruthy();
    }
    expect(container.querySelector("main")!.textContent).not.toMatch(/\b(19|20)\d{2}\b/);
  });
});

describe("skill highlighting", () => {
  it("marks only matching projects and roles when expo is selected", () => {
    const projects = render(<ProjectsPage />);
    const experience = render(<ExperiencePage />);
    act(() => useUiStore.getState().selectSkill("expo"));
    const flag = (root: HTMLElement, sel: string) =>
      Array.from(root.querySelectorAll(sel)).map((e) => e.getAttribute("data-highlight"));
    expect(flag(projects.container, "article")).toEqual([null, "true", null]);
    expect(flag(experience.container, "details")).toEqual([null, null, "true", null, null]);
  });
});

describe("year counts run to the CV's year, not the clock", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-06-15T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("a build in 2031 shows the same counts as the CV's 2026", () => {
    expect(new Date().getFullYear()).toBe(2031);
    expect(cv.asOf).toBe(2026);

    const home = render(<Home />);
    const total = `${cv.glance[0].value} yrs in dated roles`;
    expect(within(home.container).getByText(total)).toBeTruthy();
    expect(within(home.container).getByRole("button", { name: /^React ·/ }).textContent).toBe(
      `React · since 2021 · ${cv.glance[1].value} yrs`,
    );
    // Only 2026 evidence: no year count, as the spec says.
    for (const name of ["Jest", "Node.js", "TanStack Query"]) {
      expect(within(home.container).getByRole("button", { name }).textContent).toBe(name);
    }
    home.unmount();

    const exp = render(<ExperiencePage />);
    const first = exp.container.querySelector("summary")!.textContent ?? "";
    expect(first).toContain("2025–now");
    expect(first).toContain("1 yr");
    expect(first).not.toMatch(/[2-9] yrs/);
    exp.unmount();

    const skills = render(<SkillsPage />);
    expect(within(skills.container).getByText("22 of 33 skills have a dated first use")).toBeTruthy();
    expect(skills.container.textContent).not.toContain("2026:");
  });
});

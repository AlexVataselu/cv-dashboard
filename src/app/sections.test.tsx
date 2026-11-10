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
  it("has one h1, the four headline figures, every role in a line, the results and the core stack", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    for (const g of cv.glance) {
      expect(screen.getByText(g.value, { selector: ".kpi-value", exact: true })).toBeTruthy();
      expect(screen.getByText(g.label)).toBeTruthy();
    }
    const roles = within(screen.getByRole("region", { name: "Roles, scrollable" })).getAllByRole("link");
    expect(roles).toHaveLength(cv.roles.length);
    expect(roles[1].getAttribute("href")).toBe("/experience#role-pentalog");
    expect(roles[1].textContent).toContain("for Builder.ai");
    for (const i of cv.impact.slice(0, 4)) expect(screen.getByText(i.label)).toBeTruthy();
    expect(screen.getByText(`Earlier: ${cv.earlier}`)).toBeTruthy();
  });

  it("shows the core stack as words with years: no bar, gauge or width, so nothing reads as a rating", () => {
    render(<Home />);
    const card = screen.getByRole("region", { name: "Core stack, scrollable" });
    const chips = Array.from(card.querySelectorAll(".rc-chip"));
    expect(chips.map((c) => c.textContent)).toContain("React5 yrs");
    for (const chip of chips) expect(chip.querySelectorAll("[style]")).toHaveLength(0);
  });
});

describe("Experience", () => {
  it("lists the roles newest first as a radio group, the newest chosen, then the Earlier line", () => {
    render(<ExperiencePage />);
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios.map((r) => r.value)).toEqual(cv.roles.map((r) => r.id));
    expect(radios.filter((r) => r.checked).map((r) => r.value)).toEqual(["freelance-2025"]);
    expect(screen.getByText(`Earlier: ${cv.earlier}`)).toBeTruthy();
  });

  it("gives every role a page with its title, company, every bullet and its stack", () => {
    const { container } = render(<ExperiencePage />);
    for (const r of cv.roles) {
      const page = container.querySelector(`#role-${r.id}`) as HTMLElement;
      expect(page).toBeTruthy();
      expect(within(page).getByRole("heading", { level: 2 }).textContent).toBe(r.title);
      for (const b of r.bullets) expect(within(page).getByText(b)).toBeTruthy();
      for (const t of r.stack) expect(within(page).getAllByText(t).length).toBeGreaterThan(0);
    }
    const pentalog = container.querySelector("#role-pentalog") as HTMLElement;
    expect(within(pentalog).getByText("weeks to onboard junior engineers")).toBeTruthy();
    expect(pentalog.textContent).toContain("Pentalog (Globant) for Builder.ai");
  });

  it("links every skill on the CV to at least one role, listed or estimated", () => {
    for (const s of cv.skills) {
      const used = cv.roles.some((r) => r.skillIds.includes(s.id) || r.estimatedSkillIds?.includes(s.id));
      expect(used, s.id).toBe(true);
    }
  });
});

describe("Skills", () => {
  it("lists every skill once, in five groups, with its years and where it was used", () => {
    const { container } = render(<SkillsPage />);
    const rows = Array.from(container.querySelectorAll(".rc-skill"));
    expect(rows).toHaveLength(cv.skills.length);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Frontend",
      "Testing and quality",
      "State and data",
      "Backend",
      "Tooling and delivery",
    ]);
    const row = (name: string) => rows.find((r) => r.querySelector(".rc-skill-name")!.textContent === name)!;
    expect(row("React").querySelector(".rc-skill-years")!.textContent).toBe("5 yrs");
    expect(row("React").querySelector(".rc-skill-where")!.textContent).toBe(
      "Pentalog (Globant), TryAngle Labs, Freelance and 3 own projects",
    );
    expect(row("Magento").querySelector(".rc-skill-where")!.textContent).toBe("L.H.EL (Superland)");
    // an estimate is said as one, never counted in years
    expect(row("Storybook").querySelector(".rc-skill-years")!.textContent).toBe("est.");
    expect(row("Storybook").querySelector(".rc-skill-where")!.textContent).toBe("likely at Pentalog (Globant)");
  });

  it("marks the core stack, and only it", () => {
    const { container } = render(<SkillsPage />);
    const core = Array.from(container.querySelectorAll(".rc-skill[data-core] .rc-skill-name")).map((n) => n.textContent);
    expect(core).toContain("React");
    expect(core).toContain("Vitest");
    expect(core).not.toContain("jQuery");
  });
});

describe("Projects", () => {
  it("lists the four personal projects, then the product work (Builder.ai, Innobyte, LocalsOnly, Eved), with their labels", () => {
    render(<ProjectsPage />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(8);
    // the header line: the years, then (for product work) who it was done for
    expect(cards.map((c) => c.querySelector("p")!.textContent!.split(" · ")[0])).toEqual([
      "2026",
      "2026",
      "Since 2024",
      "2026",
      "2024–2025",
      "2021",
      "2023, v2 2026",
      "2013–2014",
    ]);
    const [stremio, powderino, reamp, dashboard, builder, innobyte, localsonly, eved] = cards;
    expect(within(stremio).getByRole("heading", { name: /Stremio Skip Intro/ })).toBeTruthy();
    expect(within(powderino).getByRole("heading", { name: /Powderino/ })).toBeTruthy();
    expect(within(reamp).getByRole("heading", { name: /ReAMP/ })).toBeTruthy();
    expect(within(dashboard).getByRole("heading", { name: /CV dashboard/ })).toBeTruthy();

    expect(within(builder).getByRole("heading", { name: /Builder\.ai/ })).toBeTruthy();
    expect(within(builder).getByText("Client project at Pentalog (Globant)")).toBeTruthy();
    // its pictures are Builder.ai's public pages from the Internet Archive, and the card says so
    expect(within(builder).getByText(/Internet Archive/, { selector: "p" })).toBeTruthy();
    expect(within(builder).getAllByRole("radio").map((t) => t.parentElement!.textContent)).toEqual([
      "Home",
      "Explain the idea",
      "Features",
    ]);

    expect(within(innobyte).getByRole("heading", { name: /Innobyte/ })).toBeTruthy();
    expect(within(innobyte).getByText("Client project at TryAngle Labs")).toBeTruthy();
    // ElbilAppen's four phone screens, in a phone frame
    expect(innobyte.querySelector(".gallery-phone")).toBeTruthy();
    expect(within(innobyte).getAllByRole("radio").map((t) => t.parentElement!.textContent)).toEqual([
      "Trip planner",
      "Stations map",
      "Route",
      "Vehicle",
    ]);

    expect(within(localsonly).getByRole("heading", { name: /LocalsOnly/ })).toBeTruthy();
    expect(within(localsonly).getByText("Freelance project")).toBeTruthy();
    expect(within(localsonly).getAllByRole("radio")).toHaveLength(6);

    // Eved, at Zega Software: its 2013-2014 public pages from the Internet Archive, each dated, and
    // the card keeps Alex's part apart from what the product was
    expect(within(eved).getByRole("heading", { name: /Eved/ })).toBeTruthy();
    expect(within(eved).getByText("Client project at Zega Software")).toBeTruthy();
    expect(within(eved).getAllByRole("radio").map((t) => t.parentElement!.textContent)).toEqual([
      "Home, 2013",
      "How it works",
      "For buyers",
      "For planners",
    ]);
    expect(within(eved).getAllByText(/Internet Archive/, { selector: "p" }).length).toBeGreaterThan(0);
    expect(eved.textContent).toContain("My part:");
    expect(eved.textContent).not.toMatch(/EvedPay/);

    // every project with more to say than the CV has room for shows it under Details
    for (const card of [stremio, powderino, reamp, dashboard, builder, localsonly]) {
      expect(within(card).getByRole("heading", { name: "Details" })).toBeTruthy();
    }
  });

  it("Stremio has a gallery of the fork's stream filters and the GitHub fork, each captioned", async () => {
    render(<ProjectsPage />);
    const [stremio, powderino, reamp] = screen.getAllByRole("article");
    const group = within(stremio).getByRole("group", { name: /Screenshots of Stremio/ });
    const tabs = within(group).getAllByRole("radio");
    expect(tabs.map((t) => t.parentElement!.textContent)).toEqual(["Filters", "Site dropdown", "1080p", "On GitHub"]);
    expect((tabs[0] as HTMLInputElement).checked).toBe(true);
    const figures = stremio.querySelectorAll("figure.shot");
    expect(figures).toHaveLength(4);
    for (const f of figures) expect(f.querySelector("figcaption")!.textContent).toMatch(/\d\/4\S/);
    expect(figures[0].textContent).toMatch(/Resolution chips/);
    // the first shot is the page's one eager image; the rest wait until chosen
    const imgs = [...stremio.querySelectorAll("img")];
    expect(imgs.map((i) => i.getAttribute("loading"))).toEqual(["eager", "lazy", "lazy", "lazy"]);
    for (const i of imgs) expect(i.getAttribute("width") && i.getAttribute("height")).toBeTruthy();
    await userEvent.click(tabs[3]);
    expect((tabs[3] as HTMLInputElement).checked).toBe(true);
    // Powderino keeps its facts and adds Alex's six iOS screens; ReAMP adds four in-app shots to its start screen
    expect(within(powderino).getByText("3,000+")).toBeTruthy();
    const pTabs = within(within(powderino).getByRole("group", { name: /Screenshots of Powderino/ })).getAllByRole("radio");
    expect(pTabs.map((t) => t.parentElement!.textContent)).toEqual(["Powder", "Resort", "Season", "Weather", "Air & moon", "Settings"]);
    expect(powderino.querySelector(".gallery-phone")).toBeTruthy();
    const rTabs = within(within(reamp).getByRole("group", { name: /Screenshots of ReAMP/ })).getAllByRole("radio");
    expect(rTabs.map((t) => t.parentElement!.textContent)).toEqual(["Start screen", "Decks", "Search", "Crossfade", "Mixing"]);
    expect(within(reamp).getByRole("img", { name: /ReAMP's start screen/ })).toBeTruthy();
  });
});

describe("Education", () => {
  it("shows the path from high school to the master's, and languages, with no years", () => {
    const { container } = render(<EducationPage />);
    const steps = [...container.querySelectorAll(".ed-step:not([data-work])")].map((s) => s.textContent);
    expect(steps).toEqual([
      "High schoolMathematics & Computer ScienceToma N. Socolescu Technical High School, Ploiești",
      "Bachelor'sComputer Science ManagementRomanian American University, Bucharest",
      "Master'sIT EconomicsRomanian American University, Bucharest",
    ]);
    expect(screen.getByText(cv.earlier)).toBeTruthy();
    expect(container.querySelector(".ed-step[data-work]")!.textContent).toContain("14 years building software");
    for (const l of cv.languages) {
      expect(screen.getByText(l.name)).toBeTruthy();
      expect(screen.getByText(l.level)).toBeTruthy();
    }
    expect(container.querySelector("main")!.textContent).not.toMatch(/\b(19|20)\d{2}\b/);
  });
});


describe("skill highlighting", () => {
  it("marks only matching projects when expo is selected", () => {
    const projects = render(<ProjectsPage />);
    act(() => useUiStore.getState().selectSkill("expo"));
    const flag = (root: HTMLElement, sel: string) =>
      Array.from(root.querySelectorAll(sel)).map((e) => e.getAttribute("data-highlight"));
    expect(flag(projects.container, "article")).toEqual([null, "true", null, null, null, null, null, null]);
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
    expect(home.container.querySelector(".rc-role-when")!.textContent).toBe("2025–now · 1 yr");
    const chips = Array.from(home.container.querySelectorAll(".rc-chip")).map((c) => c.textContent);
    expect(chips).toContain(`React${cv.glance[1].value} yrs`);
    home.unmount();

    const skills = render(<SkillsPage />);
    const years = (name: string) =>
      Array.from(skills.container.querySelectorAll(".rc-skill"))
        .find((r) => r.querySelector(".rc-skill-name")!.textContent === name)!
        .querySelector(".rc-skill-years")!.textContent;
    expect(years("JavaScript")).toBe("14 yrs");
    // Only 2026 evidence (their roles are estimates, never counted): no year count, as the spec says.
    expect(years("Jest")).toBe("");
    expect(years("Node.js")).toBe("");
  });
});

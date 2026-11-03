import { beforeEach, describe, expect, it } from "vitest";
import { cv } from "@/content/cv";
import { DEFAULT_ROLE, useUiStore } from "./uiStore";

const initial = useUiStore.getState();

beforeEach(() => {
  useUiStore.setState(initial, true);
});

describe("uiStore", () => {
  it("defaults to the newest role expanded", () => {
    const s = useUiStore.getState();
    expect(s.expandedRoleId).toBe("freelance-2025");
    expect(DEFAULT_ROLE).toBe(cv.roles[0].id);
    expect(s.selectedSkill).toBeNull();
    expect(s.paletteOpen).toBe(false);
  });

  it("toggleRole closes an open role", () => {
    useUiStore.getState().toggleRole("freelance-2025");
    expect(useUiStore.getState().expandedRoleId).toBeNull();
  });

  it("toggleRole opens a role and closes the previous one", () => {
    useUiStore.getState().toggleRole("pentalog");
    expect(useUiStore.getState().expandedRoleId).toBe("pentalog");
    useUiStore.getState().toggleRole("tryangle");
    expect(useUiStore.getState().expandedRoleId).toBe("tryangle");
  });

  it("selectSkill and setPaletteOpen update state", () => {
    useUiStore.getState().selectSkill("react");
    useUiStore.getState().setPaletteOpen(true);
    expect(useUiStore.getState().selectedSkill).toBe("react");
    expect(useUiStore.getState().paletteOpen).toBe(true);
  });
});

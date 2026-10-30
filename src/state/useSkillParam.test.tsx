import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { useUiStore } from "./uiStore";
import { useSkillParam } from "./useSkillParam";

const initial = useUiStore.getState();

beforeEach(() => {
  useUiStore.setState(initial, true);
  window.history.replaceState(null, "", "/");
});

describe("useSkillParam", () => {
  it("reads ?skill=react on mount", () => {
    window.history.replaceState(null, "", "/?skill=react");
    renderHook(() => useSkillParam());
    expect(useUiStore.getState().selectedSkill).toBe("react");
    expect(window.location.search).toContain("skill=react");
  });

  it.each(["?skill=cobol", "?skill="])("ignores invalid value %s", (qs) => {
    window.history.replaceState(null, "", `/${qs}`);
    expect(() => renderHook(() => useSkillParam())).not.toThrow();
    expect(useUiStore.getState().selectedSkill).toBeNull();
    expect(new URLSearchParams(window.location.search).has("skill")).toBe(false);
  });

  it("writes the selected skill to the URL, keeping other params and hash", () => {
    window.history.replaceState(null, "", "/a?x=1#top");
    renderHook(() => useSkillParam());
    act(() => useUiStore.getState().selectSkill("react"));
    expect(window.location.pathname).toBe("/a");
    expect(window.location.search).toBe("?x=1&skill=react");
    expect(window.location.hash).toBe("#top");
  });

  it("selectSkill(null) removes skill from the URL", () => {
    window.history.replaceState(null, "", "/?skill=react&x=1");
    renderHook(() => useSkillParam());
    act(() => useUiStore.getState().selectSkill(null));
    expect(window.location.search).toBe("?x=1");
  });

  it("does not push history entries", () => {
    const before = window.history.length;
    renderHook(() => useSkillParam());
    act(() => useUiStore.getState().selectSkill("react"));
    act(() => useUiStore.getState().selectSkill(null));
    expect(window.history.length).toBe(before);
  });
});

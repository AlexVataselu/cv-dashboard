import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUiStore } from "@/state/uiStore";
import { PaletteTrigger } from "./PaletteTrigger";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const initial = useUiStore.getState();
const writeText = vi.fn(() => Promise.resolve());

beforeEach(() => {
  useUiStore.setState(initial, true);
  push.mockClear();
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});

async function openViaKey(init: KeyboardEventInit) {
  render(<PaletteTrigger />);
  fireEvent.keyDown(window, init);
  return screen.findByRole("dialog");
}

describe("CommandPalette", () => {
  it("opens on Ctrl+K", async () => {
    expect(await openViaKey({ key: "k", ctrlKey: true })).toBeTruthy();
  });

  it("opens on Meta+K", async () => {
    expect(await openViaKey({ key: "k", metaKey: true })).toBeTruthy();
  });

  it("does not load the dialog until opened", () => {
    render(<PaletteTrigger />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: /Open command palette/ })).toBeTruthy();
  });

  it("filters to Skills and skill items when typing 'sk'", async () => {
    const user = userEvent.setup();
    await openViaKey({ key: "k", ctrlKey: true });
    await user.type(screen.getByRole("combobox"), "sk");
    const options = screen.getAllByRole("option").map((o) => o.textContent ?? "");
    expect(options.some((t) => t.startsWith("Skills"))).toBe(true);
    expect(options.some((t) => t.endsWith("Skill"))).toBe(true);
    expect(options.some((t) => t.startsWith("Experience"))).toBe(false);
    expect(options.some((t) => t.startsWith("Copy email"))).toBe(false);
  });

  it("Enter on a section navigates to its href", async () => {
    const user = userEvent.setup();
    await openViaKey({ key: "k", ctrlKey: true });
    await user.type(screen.getByRole("combobox"), "experience{Enter}");
    expect(push).toHaveBeenCalledWith("/experience");
    expect(useUiStore.getState().paletteOpen).toBe(false);
  });

  it("Enter on a skill selects it and navigates to /skills?skill=<id>", async () => {
    const user = userEvent.setup();
    await openViaKey({ key: "k", ctrlKey: true });
    await user.type(screen.getByRole("combobox"), "typescript{Enter}");
    expect(useUiStore.getState().selectedSkill).toBe("typescript");
    expect(push).toHaveBeenCalledWith("/skills?skill=typescript");
  });

  it("arrow keys move aria-activedescendant", async () => {
    const user = userEvent.setup();
    await openViaKey({ key: "k", ctrlKey: true });
    const input = screen.getByRole("combobox");
    const first = input.getAttribute("aria-activedescendant");
    await user.keyboard("{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).not.toBe(first);
    expect(document.getElementById(input.getAttribute("aria-activedescendant")!)).toBeTruthy();
  });

  it("Copy email writes the address to the clipboard and confirms in place", async () => {
    const user = userEvent.setup();
    // user-event installs its own clipboard stub; override it after setup.
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await openViaKey({ key: "k", ctrlKey: true });
    await user.type(screen.getByRole("combobox"), "copy{Enter}");
    expect(writeText).toHaveBeenCalledWith("vataselu.alex@gmail.com");
    await waitFor(() => expect(screen.getByRole("option").textContent).toContain("Copied"));
  });

  it("dialog is modal and labelled; Tab stays inside it", async () => {
    const user = userEvent.setup();
    const dialog = await openViaKey({ key: "k", ctrlKey: true });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    const input = screen.getByRole("combobox");
    await waitFor(() => expect(document.activeElement).toBe(input));
    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("Esc closes and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    await openViaKey({ key: "k", ctrlKey: true });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /Open command palette/ }),
    );
  });

  it("clicking the backdrop closes it", async () => {
    const dialog = await openViaKey({ key: "k", ctrlKey: true });
    act(() => {
      fireEvent.mouseDown(dialog.parentElement!);
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("after clicking an option, Esc still closes and focus goes to the trigger", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await openViaKey({ key: "k", ctrlKey: true });
    await user.click(screen.getByRole("option", { name: /Copy email/ }));
    expect(writeText).toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /Open command palette/ }),
    );
  });

  it("after clicking an option, Tab stays within the dialog", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const dialog = await openViaKey({ key: "k", ctrlKey: true });
    await user.click(screen.getByRole("option", { name: /Copy email/ }));
    for (let i = 0; i < 3; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("ignores Ctrl+Shift+K and survives a missing clipboard", async () => {
    render(<PaletteTrigger />);
    fireEvent.keyDown(window, { key: "K", ctrlKey: true, shiftKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await screen.findByRole("dialog");
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    await user.type(screen.getByRole("combobox"), "copy{Enter}");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

import { create } from "zustand";
import { cv } from "@/content/cv";

type UiState = {
  selectedSkill: string | null;
  expandedRoleId: string | null;
  paletteOpen: boolean;
  selectSkill: (id: string | null) => void;
  toggleRole: (id: string) => void;
  setPaletteOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedSkill: null,
  expandedRoleId: cv.roles[0]?.id ?? null,
  paletteOpen: false,
  selectSkill: (id) => set({ selectedSkill: id }),
  toggleRole: (id) =>
    set((s) => ({ expandedRoleId: s.expandedRoleId === id ? null : id })),
  setPaletteOpen: (open) => set({ paletteOpen: open }),
}));

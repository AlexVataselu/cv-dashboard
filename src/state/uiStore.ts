import { create } from "zustand";
/** The newest role, open on Experience until another is chosen (a test keeps it equal to cv.roles[0]). */
export const DEFAULT_ROLE = "freelance-2025";

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
  expandedRoleId: DEFAULT_ROLE,
  paletteOpen: false,
  selectSkill: (id) => set({ selectedSkill: id }),
  toggleRole: (id) =>
    set((s) => ({ expandedRoleId: s.expandedRoleId === id ? null : id })),
  setPaletteOpen: (open) => set({ paletteOpen: open }),
}));

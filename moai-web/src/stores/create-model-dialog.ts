"use client";

import { create } from "zustand";

type State = {
  open: boolean;
  templateId?: string | null;
};

type Actions = {
  openDialog: (opts?: { templateId?: string | null }) => void;
  closeDialog: () => void;
  toggleDialog: () => void;
  resetDialog: () => void;
  setTemplateId: (templateId: string | null) => void;
};

export const useCreateModelDialog = create<State & Actions>((set) => ({
  open: false,
  templateId: null,
  openDialog: (opts) =>
    set({ open: true, templateId: opts?.templateId ?? null }),
  closeDialog: () => set({ open: false, templateId: null }),
  toggleDialog: () => set((s) => ({ open: !s.open })),
  resetDialog: () => set({ open: false, templateId: null }),
  setTemplateId: (templateId) => set({ templateId }),
}));

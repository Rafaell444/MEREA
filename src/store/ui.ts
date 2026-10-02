"use client";
import { create } from "zustand";

export type Drawer = "menu" | "search" | "cart" | "filters" | "sizeGuide" | "notify" | null;

type State = {
  drawer: Drawer;
  menuTab: string; // "women" | "girls"
  drawerPayload: unknown;
  headerSolid: boolean;
  open: (d: Exclude<Drawer, null>, payload?: unknown) => void;
  close: () => void;
  setMenuTab: (t: string) => void;
  setHeaderSolid: (v: boolean) => void;
};

export const useUI = create<State>((set) => ({
  drawer: null,
  menuTab: "women",
  drawerPayload: null,
  headerSolid: false,
  open: (d, payload = null) => set({ drawer: d, drawerPayload: payload }),
  close: () => set({ drawer: null, drawerPayload: null }),
  setMenuTab: (menuTab) => set({ menuTab }),
  setHeaderSolid: (headerSolid) => set({ headerSolid }),
}));

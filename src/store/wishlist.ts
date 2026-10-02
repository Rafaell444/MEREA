"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  handles: string[];
  toggle: (handle: string) => void;
  has: (handle: string) => boolean;
  remove: (handle: string) => void;
  clear: () => void;
};

export const useWishlist = create<State>()(
  persist(
    (set, get) => ({
      handles: [],
      toggle: (handle) =>
        set((s) => ({ handles: s.handles.includes(handle) ? s.handles.filter((h) => h !== handle) : [handle, ...s.handles].slice(0, 200) })),
      has: (handle) => get().handles.includes(handle),
      remove: (handle) => set((s) => ({ handles: s.handles.filter((h) => h !== handle) })),
      clear: () => set({ handles: [] }),
    }),
    { name: "tz-wishlist" },
  ),
);

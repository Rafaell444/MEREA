"use client";
import { create } from "zustand";
import type { Cart } from "@/lib/catalog/types";

type State = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  lastAdded: { title: string; image?: string; size?: string; color?: string } | null;
  init: () => Promise<void>;
  add: (merchandiseId: string, quantity?: number, meta?: State["lastAdded"]) => Promise<boolean>;
  update: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<string | null>;
  clearLastAdded: () => void;
};

async function api(path: string, body?: unknown, method = "POST"): Promise<Cart> {
  const res = await fetch(`/api/cart${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Ошибка корзины");
  return json.cart as Cart;
}

export const useCart = create<State>((set, get) => ({
  cart: null,
  loading: false,
  error: null,
  lastAdded: null,
  async init() {
    if (get().cart) return;
    try {
      set({ loading: true });
      const cart = await api("", undefined, "GET");
      set({ cart, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  async add(merchandiseId, quantity = 1, meta = null) {
    try {
      set({ loading: true, error: null });
      const cart = await api("/add", { lines: [{ merchandiseId, quantity }] });
      set({ cart, loading: false, lastAdded: meta });
      return true;
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      return false;
    }
  },
  async update(lineId, quantity) {
    try {
      set({ loading: true });
      const cart = await api("/update", { lines: [{ id: lineId, quantity }] });
      set({ cart, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  async remove(lineId) {
    try {
      set({ loading: true });
      const cart = await api("/remove", { lineIds: [lineId] });
      set({ cart, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  async applyDiscount(code) {
    try {
      set({ loading: true });
      const cart = await api("/discount", { codes: code ? [code] : [] });
      set({ cart, loading: false });
      const applied = cart.discountCodes.find((d) => d.code.toLowerCase() === code.toLowerCase());
      if (code && applied && !applied.applicable) return "Промокод не применим";
      return null;
    } catch (e) {
      set({ loading: false });
      return (e as Error).message;
    }
  },
  clearLastAdded: () => set({ lastAdded: null }),
}));

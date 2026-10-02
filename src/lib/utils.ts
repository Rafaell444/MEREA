import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Money = { amount: number; currencyCode: string };

/** Format money the way merea.ru does: "2 199 ₽" (non-breaking spaces). */
export function formatMoney(money: Money | number | null | undefined, currency = "RUB"): string {
  if (money == null) return "";
  const amount = typeof money === "number" ? money : money.amount;
  const code = typeof money === "number" ? currency : money.currencyCode || currency;
  const whole = Math.round(amount);
  const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const symbol = code === "RUB" ? "₽" : code === "EUR" ? "€" : code === "USD" ? "$" : code;
  return `${grouped} ${symbol}`;
}

export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round((1 - price / compareAt) * 100);
}

/** Russian plural helper: plural(5, ["товар","товара","товаров"]) */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function colorsLabel(n: number) {
  return `${n} ${plural(n, ["цвет", "цвета", "цветов"])}`;
}

export function productsLabel(n: number) {
  return `${n} ${plural(n, ["товар", "товара", "товаров"])}`;
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return input
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

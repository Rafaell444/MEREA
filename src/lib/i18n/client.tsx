"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_LOCALE, localizePath, makeT, splitLocale, type Dictionary, type Locale, type TFunction } from "./config";

type Ctx = { locale: Locale; dict: Dictionary; t: TFunction };
const I18nContext = createContext<Ctx>({ locale: DEFAULT_LOCALE, dict: {}, t: (s) => s });

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, dict, t: makeT(locale, dict) }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Translate a Russian source string into the active locale. */
export function useT(): TFunction {
  return useContext(I18nContext).t;
}
export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

/** Current pathname without the locale prefix ("/en/cart" → "/cart"). */
export function usePath(): string {
  return splitLocale(usePathname() ?? "/").path;
}

/** `router.push` / `replace` that keep the active locale prefix. */
export function useLocalizedRouter() {
  const router = useRouter();
  const locale = useLocale();
  const push = useCallback((href: string, opts?: { scroll?: boolean }) => router.push(localizePath(href, locale), opts), [router, locale]);
  const replace = useCallback((href: string) => router.replace(localizePath(href, locale)), [router, locale]);
  return { push, replace, refresh: router.refresh, back: router.back };
}

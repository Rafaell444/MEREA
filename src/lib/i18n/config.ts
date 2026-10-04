/** Locale configuration shared by server, client and middleware (no server-only imports here). */
export const LOCALES = ["ka", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ka";

export const LOCALE_NAMES: Record<Locale, string> = { ka: "ქართული", en: "English", ru: "Русский" };
export const LOCALE_SHORT: Record<Locale, string> = { ka: "GE", en: "EN", ru: "RU" };
/** Shopify LanguageCode per site locale (used in @inContext) */
export const SHOPIFY_LANGUAGE: Record<Locale, string> = { ka: "KA", en: "EN", ru: "RU" };
export const HTML_LANG: Record<Locale, string> = { ka: "ka-GE", en: "en", ru: "ru" };
export const OG_LOCALE: Record<Locale, string> = { ka: "ka_GE", en: "en_US", ru: "ru_RU" };

export function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** "/en/women/bras" → { locale: "en", path: "/women/bras" }; unprefixed paths are the default locale. */
export function splitLocale(pathname: string): { locale: Locale; path: string; prefixed: boolean } {
  const seg = pathname.split("/")[1];
  if (isLocale(seg)) {
    const rest = pathname.slice(seg.length + 1) || "/";
    return { locale: seg, path: rest.startsWith("/") ? rest : `/${rest}`, prefixed: true };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || "/", prefixed: false };
}

/** Prefix an internal path with the locale (default locale has no prefix). External URLs are returned untouched. */
export function localizePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (href.startsWith("/api/") || href.startsWith("/admin") || href.startsWith("/images/") || href.startsWith("/uploads/") || href.startsWith("/_next/")) return href;
  const { path } = splitLocale(href);
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Simple "{name}" interpolation */
export function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export type Dictionary = Record<string, string>;
export type TFunction = (source: string, vars?: Record<string, string | number>) => string;

/** Source strings are Russian. `ru` returns the source; other locales look up the dictionary and fall back to the source. */
export function makeT(locale: Locale, dict: Dictionary): TFunction {
  return (source, vars) => interpolate(locale === "ru" ? source : dict[source] ?? source, vars);
}

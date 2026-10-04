import "server-only";
import { cookies, headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { DEFAULT_LOCALE, HTML_LANG, LOCALES, isLocale, localizePath, makeT, type Dictionary, type Locale, type TFunction } from "./config";
import ka from "./dictionaries/ka.json";
import en from "./dictionaries/en.json";

const STATIC: Record<Locale, Dictionary> = { ka: ka as Dictionary, en: en as Dictionary, ru: {} };

/** Current request locale: URL prefix (set by middleware as x-locale) → `lang` cookie → default. */
export async function getLocale(): Promise<Locale> {
  // No try/catch here: headers() must be allowed to opt the page into dynamic rendering,
  // otherwise a page prerendered in the default locale would be served for /en and /ru too.
  const h = await headers();
  const fromHeader = h.get("x-locale");
  if (isLocale(fromHeader)) return fromHeader;
  const c = (await cookies()).get("lang")?.value;
  if (isLocale(c)) return c;
  return DEFAULT_LOCALE;
}

/** Translations added in admin → «Переводы» override / extend the static dictionaries. */
const dbOverrides = unstable_cache(
  async (): Promise<{ source: string; ka: string | null; en: string | null }[]> => {
    try {
      return await db.translation.findMany({ select: { source: true, ka: true, en: true } });
    } catch {
      return [];
    }
  },
  ["i18n-overrides"],
  { tags: ["cms"], revalidate: 300 },
);

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === "ru") return {};
  const rows = await dbOverrides();
  const extra: Dictionary = {};
  for (const r of rows) {
    const v = locale === "ka" ? r.ka : r.en;
    if (v) extra[r.source] = v;
  }
  return { ...STATIC[locale], ...extra };
}

export async function getT(): Promise<{ t: TFunction; locale: Locale; dict: Dictionary }> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return { t: makeT(locale, dict), locale, dict };
}

/** Canonical + hreflang links for the current page (path comes from the middleware `x-path` header). */
export async function getAlternates(): Promise<{ canonical: string; languages: Record<string, string> }> {
  const locale = await getLocale();
  const path = (await headers()).get("x-path") || "/";
  const languages: Record<string, string> = { "x-default": localizePath(path, DEFAULT_LOCALE) };
  for (const l of LOCALES) languages[HTML_LANG[l]] = localizePath(path, l);
  return { canonical: localizePath(path, locale), languages };
}

/** Locale-aware internal path for server-side redirects and links. */
export async function localized(path: string): Promise<string> {
  return localizePath(path, await getLocale());
}

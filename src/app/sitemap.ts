import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { getAllCategories } from "@/lib/cms/content";
import { DEFAULT_PAGES } from "@/lib/cms/defaults";
import { DEFAULT_LOCALE, HTML_LANG, LOCALES, localizePath } from "@/lib/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const categories = await getAllCategories();
  const now = new Date();
  // One entry per page (default locale URL) with hreflang alternates for every language
  const entry = (path: string, changeFrequency: "daily" | "monthly", priority: number) => ({
    url: `${base}${localizePath(path, DEFAULT_LOCALE)}`,
    lastModified: now,
    changeFrequency,
    priority,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], `${base}${localizePath(path, l)}`])) },
  });
  return [
    entry("/", "daily", 1),
    ...categories.map((c) => entry(`/${c.path}`, "daily", 0.8)),
    ...DEFAULT_PAGES.map((p) => entry(`/pages/${p.slug}`, "monthly", 0.3)),
    entry("/stores", "monthly", 0.4),
    entry("/bonuses", "monthly", 0.4),
  ];
}

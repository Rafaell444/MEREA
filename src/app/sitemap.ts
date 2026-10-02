import type { MetadataRoute } from "next";
import { getAllCategories } from "@/lib/cms/content";
import { DEFAULT_PAGES } from "@/lib/cms/defaults";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const categories = await getAllCategories();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...categories.map((c) => ({ url: `${base}/${c.path}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...DEFAULT_PAGES.map((p) => ({ url: `${base}/pages/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 })),
    { url: `${base}/stores`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/bonuses`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
}

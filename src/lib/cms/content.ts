import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { safeJson } from "@/lib/utils";
import {
  DEFAULT_ANNOUNCEMENTS, DEFAULT_BADGES, DEFAULT_CATEGORIES, DEFAULT_FOOTER, DEFAULT_HERO_SLIDES, DEFAULT_HOME_SECTIONS, DEFAULT_MENUS, DEFAULT_PAGES,
  DEFAULT_POPUPS, DEFAULT_SETTINGS, DEFAULT_SIZE_GUIDES, DEFAULT_STORES, type MenuNode, type SiteSettings,
} from "./defaults";

export const CMS_TAG = "cms";
export function revalidateCms() {
  revalidateTag(CMS_TAG);
}

/** Wrap a DB read: cache it, fall back to defaults if the DB is unavailable or empty. */
function cached<T>(key: string, fn: () => Promise<T>, fallback: () => T) {
  return unstable_cache(
    async () => {
      try {
        const v = await fn();
        if (v === null || v === undefined || (Array.isArray(v) && v.length === 0)) return fallback();
        return v;
      } catch (e) {
        if (process.env.NODE_ENV === "development") console.warn(`[cms] ${key} fallback:`, (e as Error).message);
        return fallback();
      }
    },
    [key],
    { tags: [CMS_TAG], revalidate: 300 },
  );
}

/* ---------------- Settings ---------------- */
export const getSettings = cached<SiteSettings>(
  "settings",
  async () => {
    const rows = await db.setting.findMany();
    if (!rows.length) return DEFAULT_SETTINGS;
    const obj: Record<string, unknown> = {};
    rows.forEach((r) => (obj[r.key] = safeJson(r.value, null)));
    return { ...DEFAULT_SETTINGS, ...obj } as SiteSettings;
  },
  () => DEFAULT_SETTINGS,
);

/* ---------------- Announcements (marquee) ---------------- */
export type Announcement = { id?: string; text: string; href?: string | null };
export const getAnnouncements = cached<Announcement[]>(
  "announcements",
  async () => {
    const now = new Date();
    const rows = await db.announcement.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } });
    return rows.filter((r) => (!r.startsAt || r.startsAt <= now) && (!r.endsAt || r.endsAt >= now)).map((r) => ({ id: r.id, text: r.text, href: r.href }));
  },
  () => DEFAULT_ANNOUNCEMENTS,
);

/* ---------------- Hero ---------------- */
export type HeroSlide = {
  id?: string; title: string; subtitle?: string | null; note?: string | null; ctaText?: string | null; ctaHref?: string | null;
  image: string; imageMobile?: string | null; video?: string | null; textTheme: string; align: string;
};
export const getHeroSlides = cached<HeroSlide[]>(
  "hero",
  async () => db.heroSlide.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
  () => DEFAULT_HERO_SLIDES as HeroSlide[],
);

/* ---------------- Home sections ---------------- */
export type HomeSection = { id?: string; type: string; title?: string | null; subtitle?: string | null; config: Record<string, unknown> };
export const getHomeSections = cached<HomeSection[]>(
  "home-sections",
  async () => {
    const rows = await db.homeSection.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } });
    return rows.map((r) => ({ id: r.id, type: r.type, title: r.title, subtitle: r.subtitle, config: safeJson<Record<string, unknown>>(r.config, {}) }));
  },
  () => DEFAULT_HOME_SECTIONS.map((s) => ({ ...s, config: s.config as Record<string, unknown> })),
);

/* ---------------- Menus ---------------- */
export const getMenu = (menu: string) =>
  cached<MenuNode[]>(
    `menu:${menu}`,
    async () => {
      const rows = await db.menuItem.findMany({ where: { menu, enabled: true }, orderBy: { sortOrder: "asc" } });
      if (!rows.length) return [];
      const byParent = new Map<string | null, typeof rows>();
      rows.forEach((r) => byParent.set(r.parentId, [...(byParent.get(r.parentId) ?? []), r]));
      const build = (parentId: string | null): MenuNode[] =>
        (byParent.get(parentId) ?? []).map((r) => ({
          id: r.id, label: r.label, href: r.href ?? undefined, badgeText: r.badgeText ?? undefined, badgeColor: r.badgeColor ?? undefined,
          textColor: r.textColor ?? undefined, image: r.image ?? undefined, children: build(r.id),
        }));
      return build(null);
    },
    () => DEFAULT_MENUS[menu] ?? [],
  )();

/* ---------------- Footer ---------------- */
export type FooterColumn = { id?: string; title: string; links: { label: string; href: string }[] };
export const getFooter = cached<FooterColumn[]>(
  "footer",
  async () => {
    const cols = await db.footerColumn.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" }, include: { links: { where: { enabled: true }, orderBy: { sortOrder: "asc" } } } });
    return cols.map((c) => ({ id: c.id, title: c.title, links: c.links.map((l) => ({ label: l.label, href: l.href })) }));
  },
  () => DEFAULT_FOOTER,
);

/* ---------------- Popups ---------------- */
export type PopupConfig = {
  key: string; name: string; enabled: boolean; title: string; body?: string | null; image?: string | null; ctaText?: string | null; ctaHref?: string | null;
  secondaryText?: string | null; delaySeconds: number; scrollPercent: number; frequencyDays: number; showOnPaths: string[]; excludePaths: string[]; config: Record<string, unknown>;
};
export const getPopups = cached<PopupConfig[]>(
  "popups",
  async () => {
    const now = new Date();
    const rows = await db.popup.findMany({ where: { enabled: true } });
    return rows
      .filter((r) => (!r.startsAt || r.startsAt <= now) && (!r.endsAt || r.endsAt >= now))
      .map((r) => ({
        key: r.key, name: r.name, enabled: r.enabled, title: r.title, body: r.body, image: r.image, ctaText: r.ctaText, ctaHref: r.ctaHref, secondaryText: r.secondaryText,
        delaySeconds: r.delaySeconds, scrollPercent: r.scrollPercent, frequencyDays: r.frequencyDays,
        showOnPaths: safeJson<string[]>(r.showOnPaths, []), excludePaths: safeJson<string[]>(r.excludePaths, []), config: safeJson<Record<string, unknown>>(r.config, {}),
      }));
  },
  () => DEFAULT_POPUPS.map((p) => ({ scrollPercent: 0, showOnPaths: [], excludePaths: [], ...p, config: (p.config ?? {}) as Record<string, unknown> })) as PopupConfig[],
);

/* ---------------- Categories ---------------- */
export type CategoryPage = {
  id?: string; path: string; title: string; navTitle?: string | null; collectionHandle?: string | null; parentPath?: string | null; image?: string | null;
  seoTitle?: string | null; seoDescription?: string | null; seoText?: string | null; bannerImage?: string | null; bannerTitle?: string | null; bannerText?: string | null;
  showInTiles: boolean; sortOrder: number;
};
export const getAllCategories = cached<CategoryPage[]>(
  "categories",
  async () => db.categoryPage.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
  () => DEFAULT_CATEGORIES as unknown as CategoryPage[],
);
export async function getCategory(path: string) {
  const all = await getAllCategories();
  return all.find((c) => c.path === path) ?? null;
}
export async function getCategoryChildren(path: string) {
  const all = await getAllCategories();
  return all.filter((c) => c.parentPath === path && c.showInTiles).sort((a, b) => a.sortOrder - b.sortOrder);
}
export async function getCategoryBreadcrumbs(path: string) {
  const all = await getAllCategories();
  const crumbs: { label: string; href: string }[] = [];
  let cur = all.find((c) => c.path === path) ?? null;
  while (cur) {
    crumbs.unshift({ label: cur.navTitle ?? cur.title, href: `/${cur.path}` });
    cur = cur.parentPath ? all.find((c) => c.path === cur!.parentPath) ?? null : null;
  }
  return crumbs;
}

/* ---------------- Badges ---------------- */
export type PromoBadge = { tag: string; label: string; textColor: string; bgColor: string; position: string };
export const getBadges = cached<PromoBadge[]>(
  "badges",
  async () => db.promoBadge.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
  () => DEFAULT_BADGES,
);

/* ---------------- Pages ---------------- */
export type CmsPage = { slug: string; title: string; body: string; seoTitle?: string | null; seoDescription?: string | null };
export async function getPage(slug: string): Promise<CmsPage | null> {
  try {
    const p = await db.page.findFirst({ where: { slug, published: true } });
    if (p) return p;
  } catch { /* fallback */ }
  return DEFAULT_PAGES.find((p) => p.slug === slug) ?? null;
}

/* ---------------- Stores ---------------- */
export type StoreLocation = { id?: string; name: string; city: string; address: string; hours?: string | null; phone?: string | null; lat?: number | null; lng?: number | null };
export const getStores = cached<StoreLocation[]>(
  "stores",
  async () => db.store.findMany({ where: { enabled: true }, orderBy: [{ city: "asc" }, { sortOrder: "asc" }] }),
  () => DEFAULT_STORES,
);

/* ---------------- Size guides ---------------- */
export type SizeGuide = { key: string; title: string; content: { note?: string; columns: string[]; rows: string[][] } };
export const getSizeGuides = cached<SizeGuide[]>(
  "size-guides",
  async () => {
    const rows = await db.sizeGuide.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map((r) => ({ key: r.key, title: r.title, content: safeJson(r.content, { columns: [], rows: [] }) }));
  },
  () => DEFAULT_SIZE_GUIDES as SizeGuide[],
);

/* ---------------- Reviews ---------------- */
export async function getReviews(productHandle: string) {
  try {
    return await db.review.findMany({ where: { productHandle, approved: true }, orderBy: { createdAt: "desc" }, take: 20 });
  } catch {
    return [];
  }
}

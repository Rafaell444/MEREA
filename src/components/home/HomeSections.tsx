import { getCatalog } from "@/lib/catalog";
import { getBadges, getHeroSlides, type HomeSection } from "@/lib/cms/content";
import Hero from "./Hero";
import Banner from "./Banner";
import Editorial from "./Editorial";
import PromoStrip from "./PromoStrip";
import CategoryTiles from "./CategoryTiles";
import ProductCarousel from "@/components/product/ProductCarousel";
import { getT } from "@/lib/i18n/server";

type Cfg = Record<string, unknown>;

async function productsFor(cfg: Cfg) {
  const catalog = await getCatalog();
  const handle = typeof cfg.collection === "string" ? cfg.collection : null;
  const limit = typeof cfg.limit === "number" ? cfg.limit : 12;
  if (!handle) return [];
  const col = await catalog.getCollection(handle, { first: limit }).catch(() => null);
  return col?.products ?? [];
}

/** Server renderer for ordered CMS home sections. */
export default async function HomeSections({ sections }: { sections: HomeSection[] }) {
  const badges = await getBadges();
  const { t } = await getT();
  const rendered = await Promise.all(
    sections.map(async (s, i) => {
      const cfg = s.config as Cfg;
      switch (s.type) {
        case "hero": {
          const slides = await getHeroSlides();
          return <Hero key={s.id ?? i} slides={slides} />;
        }
        case "product_carousel": {
          const products = await productsFor(cfg);
          return <ProductCarousel key={s.id ?? i} title={s.title ? t(s.title) : s.title} subtitle={s.subtitle ? t(s.subtitle) : s.subtitle} href={typeof cfg.href === "string" ? cfg.href : undefined} products={products} badges={badges} />;
        }
        case "editorial": {
          const products = await productsFor(cfg);
          return <Editorial key={s.id ?? i} title={s.title} subtitle={s.subtitle} image={cfg.image as string} links={(cfg.links as { label: string; href: string }[]) ?? []} products={products} badges={badges} />;
        }
        case "banner": {
          const products = await productsFor(cfg);
          return <Banner key={s.id ?? i} title={s.title} subtitle={s.subtitle} image={cfg.image as string} cta={cfg.cta as string} href={cfg.href as string} textTheme={cfg.textTheme as string} products={products} badges={badges} />;
        }
        case "promo_strip":
          return <PromoStrip key={s.id ?? i} items={(cfg.items as { text: string; cta?: string; href?: string }[]) ?? []} />;
        case "category_tiles":
          return <CategoryTiles key={s.id ?? i} title={s.title} items={(cfg.items as { label: string; href: string; image?: string }[]) ?? []} />;
        case "text":
          return (
            <section key={s.id ?? i} className="px-4 py-8 sm:px-10">
              {s.title && <h2 className="mb-3 text-xl font-bold">{t(s.title)}</h2>}
              <div className="prose-cms max-w-3xl" dangerouslySetInnerHTML={{ __html: String(cfg.html ?? "") }} />
            </section>
          );
        default:
          return null;
      }
    }),
  );
  return <>{rendered}</>;
}

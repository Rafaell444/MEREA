import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { getAllCategories, getBadges, getReviews } from "@/lib/cms/content";
import Breadcrumbs, { type Crumb } from "@/components/plp/Breadcrumbs";
import Gallery from "@/components/product/Gallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductCarousel from "@/components/product/ProductCarousel";
import Reviews from "@/components/product/Reviews";
import { PromoBadge } from "@/components/ui/Badge";
import { resolveBadges } from "@/lib/badges";

export const revalidate = 120;

type Params = { handle: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  const catalog = await getCatalog();
  const p = await catalog.getProduct(handle).catch(() => null);
  if (!p) return {};
  return {
    title: p.seo?.title ?? `${p.title} Merea — купить`,
    description: p.seo?.description ?? p.description.slice(0, 160),
    alternates: { canonical: `/product/${p.handle}` },
    openGraph: { images: p.images[0] ? [{ url: p.images[0].url }] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const catalog = await getCatalog();
  const product = await catalog.getProduct(handle).catch(() => null);
  if (!product) notFound();

  const [badges, reviews, recs, categories] = await Promise.all([
    getBadges(),
    getReviews(product.handle),
    catalog.getRecommendations(product.id, 12).catch(() => []),
    getAllCategories(),
  ]);

  // Breadcrumbs: deepest CMS category whose collection matches one of the product's collections
  const handles = new Set(product.collections.map((c) => c.handle));
  const matched = categories.filter((c) => c.collectionHandle && handles.has(c.collectionHandle)).sort((a, b) => b.path.length - a.path.length)[0];
  const crumbs: Crumb[] = [];
  if (matched) {
    let cur: typeof matched | undefined = matched;
    while (cur) {
      crumbs.unshift({ label: cur.navTitle ?? cur.title, href: `/${cur.path}` });
      cur = cur.parentPath ? categories.find((c) => c.path === cur!.parentPath) : undefined;
    }
  }
  crumbs.push({ label: product.title });

  const ratingFromReviews = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating ?? 0;
  const reviewCount = reviews.length || product.reviewCount || 0;
  const resolved = resolveBadges(product, badges);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Merea" },
    offers: { "@type": "AggregateOffer", priceCurrency: product.price.currencyCode, lowPrice: product.price.amount, availability: product.variants.some((v) => v.availableForSale) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    ...(reviewCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue: ratingFromReviews.toFixed(1), reviewCount } } : {}),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={crumbs} className="my-3 h-[18px] pl-4 sm:mx-10" />
      <div className="flex w-full flex-row flex-wrap gap-6 sm:flex-nowrap sm:px-10">
        <div className="w-full shrink-0 grow-0 sm:min-w-0 sm:basis-[60%]">
          <Gallery
            images={product.images}
            title={product.title}
            badges={resolved.map((b) => <PromoBadge key={b.tag} label={b.label} textColor={b.textColor} bgColor={b.bgColor} />)}
          />
        </div>
        <div className="w-full shrink-0 px-4 sm:sticky sm:top-[72px] sm:min-w-0 sm:basis-[40%] sm:self-start sm:px-0 sm:pl-10">
          <ProductInfo product={product} badges={badges} reviewCount={reviewCount} rating={ratingFromReviews} />
        </div>
      </div>

      <ProductCarousel title="Тебе может также понравиться" products={recs} badges={badges} className="mt-6" />
      <Reviews productHandle={product.handle} reviews={reviews.map((r) => ({ ...r, createdAt: r.createdAt.toString() }))} rating={ratingFromReviews} />
    </div>
  );
}

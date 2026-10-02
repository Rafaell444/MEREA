import type { ProductCard } from "@/lib/catalog/types";
import type { PromoBadge } from "@/lib/cms/content";

/** Match CMS promo badges to a product's tags / flags, in the same order the live site shows them. */
export function resolveBadges(product: ProductCard, defs: PromoBadge[]): PromoBadge[] {
  const tags = product.tags.map((t) => t.toLowerCase());
  const out = defs.filter((b) => tags.includes(b.tag.toLowerCase()));
  if (product.isSale && !out.some((b) => b.tag === "sale")) {
    const sale = defs.find((b) => b.tag === "sale");
    if (sale) out.push(sale);
  }
  if (product.isNew && !out.some((b) => b.tag === "new")) {
    const n = defs.find((b) => b.tag === "new");
    if (n) out.unshift(n);
  }
  // material / new first, "3=4" last — like the real tiles
  return out.sort((a, b) => (a.tag === "3=4" ? 1 : 0) - (b.tag === "3=4" ? 1 : 0));
}

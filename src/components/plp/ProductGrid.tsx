import type { ProductCard } from "@/lib/catalog/types";
import type { PromoBadge } from "@/lib/cms/content";
import ProductTile from "@/components/product/ProductTile";

export default function ProductGrid({ products, badges }: { products: ProductCard[]; badges: PromoBadge[] }) {
  if (!products.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-bold">Ничего не найдено</p>
        <p className="mt-2 text-sm text-gray-500">Попробуй изменить фильтры или выбрать другую категорию.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-4 sm:gap-x-4">
      {products.map((p, i) => (
        <ProductTile key={p.id} product={p} badges={badges} priority={i < 4} />
      ))}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductCard } from "@/lib/catalog/types";
import type { PromoBadge } from "@/lib/cms/content";
import ProductTile from "./ProductTile";
import { useWishlist } from "@/store/wishlist";

export default function WishlistView({ badges }: { badges: PromoBadge[] }) {
  const handles = useWishlist((s) => s.handles);
  const [products, setProducts] = useState<ProductCard[] | null>(null);

  useEffect(() => {
    if (!handles.length) { setProducts([]); return; }
    fetch(`/api/products?handles=${encodeURIComponent(handles.join(","))}`)
      .then((r) => r.json())
      .then((j) => setProducts(j.products ?? []))
      .catch(() => setProducts([]));
  }, [handles]);

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <h1 className="text-2xl font-normal sm:text-[32px]">Избранное</h1>
      {products === null && <p className="mt-6 text-sm text-gray-500">Загружаем…</p>}
      {products && products.length === 0 && (
        <div className="mt-4 animate-fade-in">
          <p className="text-sm text-gray-900">В избранном пока пусто. Нажми на сердечко у товара, чтобы сохранить его здесь.</p>
          <Link href="/zhenschinam" className="btn-primary mt-8 h-12 px-12">К покупкам</Link>
        </div>
      )}
      {products && products.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-4 sm:gap-x-4">
          {products.map((p) => <ProductTile key={p.id} product={p} badges={badges} />)}
        </div>
      )}
    </div>
  );
}

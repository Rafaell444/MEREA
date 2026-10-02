import type { Metadata } from "next";
import WishlistView from "@/components/product/WishlistView";
import { getBadges } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Избранное", robots: { index: false } };

export default async function WishlistPage() {
  const badges = await getBadges();
  return <WishlistView badges={badges} />;
}

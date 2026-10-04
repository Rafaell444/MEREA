import type { Metadata } from "next";
import WishlistView from "@/components/product/WishlistView";
import { getBadges } from "@/lib/cms/content";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Избранное"), robots: { index: false } };
}

export default async function WishlistPage() {
  const badges = await getBadges();
  return <WishlistView badges={badges} />;
}

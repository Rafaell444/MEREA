import type { Metadata } from "next";
import HomeSections from "@/components/home/HomeSections";
import { getHomeSections, getSettings } from "@/lib/cms/content";
import { getT } from "@/lib/i18n/server";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const { t } = await getT();
  return { title: { absolute: t(s.seoTitle) }, description: t(s.seoDescription) };
}

export default async function HomePage() {
  const sections = await getHomeSections();
  return <HomeSections sections={sections} />;
}

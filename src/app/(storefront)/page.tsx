import type { Metadata } from "next";
import HomeSections from "@/components/home/HomeSections";
import { getHomeSections, getSettings } from "@/lib/cms/content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { absolute: s.seoTitle }, description: s.seoDescription, alternates: { canonical: "/" } };
}

export default async function HomePage() {
  const sections = await getHomeSections();
  return <HomeSections sections={sections} />;
}

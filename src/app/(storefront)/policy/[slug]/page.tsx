import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms/content";
import Breadcrumbs from "@/components/plp/Breadcrumbs";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return { title: page.seoTitle ?? page.title, description: page.seoDescription ?? undefined };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <div className="px-4 py-4 sm:px-10">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Юридическая информация" }, { label: page.title }]} />
      <article className="mx-auto max-w-3xl py-8">
        <h1 className="text-2xl font-normal sm:text-[32px]">{page.title}</h1>
        <div className="prose-cms mt-6" dangerouslySetInnerHTML={{ __html: page.body }} />
      </article>
    </div>
  );
}

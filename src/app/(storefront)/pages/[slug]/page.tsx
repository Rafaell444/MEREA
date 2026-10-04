import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/cms/content";
import Breadcrumbs from "@/components/plp/Breadcrumbs";
import { getT } from "@/lib/i18n/server";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  const { t } = await getT();
  return { title: t(page.seoTitle ?? page.title), description: page.seoDescription ? t(page.seoDescription) : undefined };
}

export default async function CmsPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  const { t } = await getT();
  return (
    <div className="px-4 py-4 sm:px-10">
      <Breadcrumbs items={[{ label: t("Главная"), href: "/" }, { label: t(page.title) }]} />
      <article className="mx-auto max-w-3xl py-8">
        <h1 className="text-2xl font-normal sm:text-[32px]">{t(page.title)}</h1>
        <div className="prose-cms mt-6" dangerouslySetInnerHTML={{ __html: t(page.body) }} />
      </article>
    </div>
  );
}

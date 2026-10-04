import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";
import { getSettings } from "@/lib/cms/content";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Связаться с нами") };
}

export default async function ContactPage() {
  const s = await getSettings();
  const { t } = await getT();
  return (
    <div className="grid gap-10 px-4 py-8 sm:px-10 lg:grid-cols-[1fr_360px]">
      <div className="max-w-xl">
        <h1 className="text-2xl font-normal sm:text-[32px]">{t("Нужна помощь?")}</h1>
        <p className="mt-2 text-sm text-gray-500">{t("Напиши нам — ответим в течение одного рабочего дня.")}</p>
        <ContactForm />
      </div>
      <aside className="rounded-sm bg-off-white p-6 text-sm lg:self-start">
        <p className="font-bold">{t("Служба поддержки клиентов")}</p>
        <p className="mt-3">{s.supportPhone}</p>
        <p className="mt-1">{s.supportEmail}</p>
        <p className="mt-3 text-xsm text-gray-500">{t("Пн–Вс, 10:00–20:00 (Тбилиси)")}</p>
      </aside>
    </div>
  );
}

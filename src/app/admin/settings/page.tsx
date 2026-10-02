import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/cms/content";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const session = (await getAdminSession())!;
  if (!["owner", "admin"].includes(session.role)) notFound();
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold">Настройки сайта</h1>
      <p className="mb-6 text-xsm text-gray-500">Общие параметры: логотип, контакты, соцсети, тексты, SEO. Ключи Shopify задаются только в файле .env на сервере — они никогда не хранятся в базе и не показываются в браузере.</p>
      <SettingsForm initial={settings as unknown as Record<string, unknown>} />
    </div>
  );
}

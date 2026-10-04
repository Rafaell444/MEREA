import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { Gift, Percent, Star, Cake } from "lucide-react";
import { getPage } from "@/lib/cms/content";
import { optionalCustomer } from "@/lib/account";
import AccountShell from "@/components/account/AccountShell";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Программа лояльности") };
}
export const dynamic = "force-dynamic";

// i18n: t("-10% на первый заказ") t("Промокод сразу после регистрации") t("Бонусы за покупки") t("До 10% от суммы заказа возвращается бонусами") t("Подарок на день рождения") t("Персональная скидка в твой праздник") t("Закрытые распродажи") t("Ранний доступ к акциям и новинкам")
const PERKS = [
  { icon: Percent, title: "-10% на первый заказ", text: "Промокод сразу после регистрации" },
  { icon: Star, title: "Бонусы за покупки", text: "До 10% от суммы заказа возвращается бонусами" },
  { icon: Cake, title: "Подарок на день рождения", text: "Персональная скидка в твой праздник" },
  { icon: Gift, title: "Закрытые распродажи", text: "Ранний доступ к акциям и новинкам" },
];

export default async function BonusesPage() {
  const [page, customer] = await Promise.all([getPage("loyalty"), optionalCustomer()]);
  const { t, locale } = await getT();
  const dl = locale === "ka" ? "ka-GE" : locale === "en" ? "en-GB" : "ru-RU";

  if (customer) {
    const history = customer.bonusHistory ?? [];
    const balance = customer.bonusBalance ?? 0;
    const tier = balance >= 5000 ? "Gold" : balance >= 1500 ? "Silver" : "Welcome";
    const nextTier = balance >= 5000 ? null : balance >= 1500 ? 5000 : 1500;
    return (
      <AccountShell title={t("Бонусы")} subtitle={t("Merey Club — твоя карта лояльности")} name={customer.email}>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="relative overflow-hidden rounded-lg bg-[linear-gradient(135deg,#1c1c1c,#4a2b33_60%,#9c5d57)] p-6 text-white sm:p-8">
            <p className="text-xsm font-bold uppercase tracking-[0.3em] text-white/70">Merey Club · {tier}</p>
            <p className="mt-6 text-5xl font-bold">{balance}</p>
            <p className="text-sm text-white/80">{t("бонусов на счету · 1 бонус = 1 ₾")}</p>
            <p className="mt-6 font-mono text-sm tracking-[0.25em] text-white/80">{customer.id.replace(/\D/g, "").slice(0, 12).padEnd(12, "0").replace(/(\d{4})(?=\d)/g, "$1 ")}</p>
            <p className="mt-1 text-xsm text-white/60">{[customer.firstName, customer.lastName].filter(Boolean).join(" ").toUpperCase() || customer.email}</p>
            {nextTier && (
              <div className="mt-6">
                <div className="h-1 rounded-full bg-white/20"><div className="h-1 rounded-full bg-white" style={{ width: `${Math.min(100, (balance / nextTier) * 100)}%` }} /></div>
                <p className="mt-1 text-[11px] text-white/70">{t("До уровня {tier} осталось бонусов: {n}", { tier: tier === "Welcome" ? "Silver" : "Gold", n: nextTier - balance })}</p>
              </div>
            )}
          </div>
          <div className="rounded-sm border border-gray-200 p-5 text-sm">
            <p className="font-bold">{t("Как использовать")}</p>
            <ul className="mt-3 space-y-2 text-xsm text-gray-900">
              <li>• {t("Оплачивай бонусами до 30% стоимости заказа при оформлении.")}</li>
              <li>• {t("Бонусы начисляются через 14 дней после получения заказа.")}</li>
              <li>• {t("Срок действия бонусов — 12 месяцев.")}</li>
              <li>• {t("Покажи карту в магазине — номер в приложении кассы.")}</li>
            </ul>
            <Link href="/policy/loyalty-rules" className="mt-4 inline-block text-xsm underline underline-offset-4">{t("Правила программы")}</Link>
          </div>
        </div>
        <h2 className="mb-3 mt-8 text-sm font-bold">{t("История операций")}</h2>
        <div className="overflow-hidden rounded-sm border border-gray-200">
          <table className="w-full text-left text-xsm">
            <thead className="bg-off-white text-[10px] uppercase tracking-wider text-gray-500"><tr><th className="px-4 py-2">{t("Дата")}</th><th className="px-4 py-2">{t("Операция")}</th><th className="px-4 py-2 text-right">{t("Бонусы")}</th></tr></thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={3} className="px-4 py-4 text-gray-500">{t("Операций пока нет — бонусы появятся после первой покупки.")}</td></tr>}
              {history.map((h, i) => (
                <tr key={i} className="border-t border-gray-100"><td className="px-4 py-2 text-gray-500">{new Date(h.date).toLocaleDateString(dl)}</td><td className="px-4 py-2">{t(h.note)}</td><td className={`px-4 py-2 text-right font-medium ${h.amount < 0 ? "text-error" : "text-success"}`}>{h.amount > 0 ? "+" : ""}{h.amount}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccountShell>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-pale-pink px-4 py-14 text-center sm:px-10 sm:py-20">
        <p className="text-xsm font-bold uppercase tracking-widest text-brand-pink">Merey Club</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-[44px]">{t("Программа лояльности")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-gray-900">{t("Копи бонусы, получай персональные скидки и первой узнавай о новинках.")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/myprofile/register" className="btn-primary h-12 px-10">{t("Присоединиться")}</Link>
          <Link href="/myprofile?next=/bonuses" className="btn-outline h-12 px-10">{t("Уже участник — войти")}</Link>
        </div>
      </section>
      <section className="grid gap-6 px-4 py-12 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-sm border border-gray-200 p-6 transition-colors hover:border-black">
            <Icon size={24} strokeWidth={1.5} />
            <p className="mt-4 text-sm font-bold">{t(title)}</p>
            <p className="mt-1 text-xsm text-gray-500">{t(text)}</p>
          </div>
        ))}
      </section>
      {page && <section className="prose-cms mx-auto max-w-3xl px-4 pb-12" dangerouslySetInnerHTML={{ __html: t(page.body) }} />}
    </div>
  );
}

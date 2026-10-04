import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { requireCustomer } from "@/lib/account";
import AccountShell from "@/components/account/AccountShell";
import GiftCardCheck from "@/components/account/GiftCardCheck";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Подарочные карты"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  const { customer } = await requireCustomer("/myprofile/gift-cards");
  const { t } = await getT();
  return (
    <AccountShell title={t("Подарочные карты")} subtitle={t("Проверь баланс карты или купи новую")} name={customer.email}>
      <div className="grid gap-6 lg:grid-cols-2">
        <GiftCardCheck />
        <div className="rounded-lg bg-[linear-gradient(135deg,#fbe9ee,#e5a4bb)] p-6 sm:p-8">
          <p className="text-xsm font-bold uppercase tracking-widest text-badge">{t("Подарок, который точно подойдет")}</p>
          <p className="mt-3 text-2xl font-bold">{t("Подарочная карта Merey")}</p>
          <p className="mt-2 text-sm text-gray-900">{t("Номиналы от 50 до 500 ₾. Действует 12 месяцев во всех магазинах и онлайн.")}</p>
          <Link href="/pages/gift-cards" className="btn-primary mt-6 h-11 px-8 text-xsm">{t("Подробнее")}</Link>
        </div>
      </div>
    </AccountShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/account";
import AccountShell from "@/components/account/AccountShell";
import GiftCardCheck from "@/components/account/GiftCardCheck";

export const metadata: Metadata = { title: "Подарочные карты", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  const { customer } = await requireCustomer("/myprofile/gift-cards");
  return (
    <AccountShell title="Подарочные карты" subtitle="Проверь баланс карты или купи новую" name={customer.email}>
      <div className="grid gap-6 lg:grid-cols-2">
        <GiftCardCheck />
        <div className="rounded-lg bg-[linear-gradient(135deg,#fbe9ee,#e5a4bb)] p-6 sm:p-8">
          <p className="text-xsm font-bold uppercase tracking-widest text-badge">Подарок, который точно подойдет</p>
          <p className="mt-3 text-2xl font-bold">Подарочная карта Merea</p>
          <p className="mt-2 text-sm text-gray-900">Номиналы от 1 000 до 15 000 ₽. Действует 12 месяцев во всех магазинах и онлайн.</p>
          <Link href="/pages/gift-cards" className="btn-primary mt-6 h-11 px-8 text-xsm">Подробнее</Link>
        </div>
      </div>
    </AccountShell>
  );
}

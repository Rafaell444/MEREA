import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, MapPin, Gift, Heart, ArrowRight } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { getCustomerToken } from "@/lib/auth/session";
import { orderStatus } from "@/lib/account";
import { formatMoney } from "@/lib/utils";
import AuthForm from "@/components/account/AuthForm";
import AccountShell from "@/components/account/AccountShell";
import LogoutButton from "@/components/account/LogoutButton";

export const metadata: Metadata = { title: "Профиль", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const token = await getCustomerToken();
  const { next } = await searchParams;
  const catalog = await getCatalog();
  const customer = token ? await catalog.getCustomer(token).catch(() => null) : null;

  if (!customer) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <h1 className="text-center text-2xl font-normal">Вход</h1>
        <p className="mt-2 text-center text-sm text-gray-500">Войди, чтобы видеть заказы, бонусы и избранное</p>
        <AuthForm mode="login" next={next} />
        <p className="mt-6 text-center text-sm">
          Нет аккаунта? <Link href="/myprofile/register" className="underline underline-offset-4">Зарегистрироваться</Link>
        </p>
      </div>
    );
  }
  if (next && next.startsWith("/") && !next.startsWith("/myprofile")) redirect(next);

  const orders = await catalog.getCustomerOrders(token!).catch(() => []);
  const last = orders[0];
  const addresses = customer.addresses ?? [];
  const def = addresses.find((a) => a.isDefault) ?? addresses[0];
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;

  return (
    <AccountShell title={`Привет${customer.firstName ? `, ${customer.firstName}` : ""}!`} subtitle={customer.email} name={name}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm bg-pale-pink p-5">
          <p className="flex items-center gap-2 text-xsm font-bold uppercase tracking-wider text-badge"><Gift size={14} /> Merea Club</p>
          <p className="mt-3 text-3xl font-bold">{customer.bonusBalance ?? 0} <span className="text-base font-normal">бонусов</span></p>
          <p className="mt-1 text-xsm text-gray-900">1 бонус = 1 ₽. Оплачивай бонусами до 30% заказа.</p>
          <Link href="/bonuses" className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">История начислений <ArrowRight size={12} /></Link>
        </div>
        <div className="rounded-sm border border-gray-200 p-5">
          <p className="flex items-center gap-2 text-xsm font-bold uppercase tracking-wider text-gray-500"><Package size={14} /> Последний заказ</p>
          {last ? (
            <>
              <p className="mt-3 text-sm font-bold">Заказ №{last.orderNumber}</p>
              <p className="text-xsm text-gray-500">{new Date(last.processedAt).toLocaleDateString("ru-RU")} · {orderStatus(last)} · {formatMoney(last.totalPrice)}</p>
              <p className="mt-2 line-clamp-2 text-xsm">{last.lineItems.map((li) => li.title).join(", ")}</p>
              <Link href={`/orders/${encodeURIComponent(last.id.split("/").pop() ?? last.id)}`} className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">Подробнее <ArrowRight size={12} /></Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-gray-900">Заказов пока нет.</p>
              <Link href="/zhenschinam" className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">К покупкам <ArrowRight size={12} /></Link>
            </>
          )}
        </div>
        <div className="rounded-sm border border-gray-200 p-5">
          <p className="flex items-center gap-2 text-xsm font-bold uppercase tracking-wider text-gray-500"><MapPin size={14} /> Адрес доставки</p>
          {def ? (
            <p className="mt-3 text-sm leading-6">{[def.firstName, def.lastName].filter(Boolean).join(" ")}<br />{def.address1}{def.address2 ? `, ${def.address2}` : ""}<br />{def.zip ? `${def.zip}, ` : ""}{def.city}</p>
          ) : (
            <p className="mt-3 text-sm text-gray-900">Адрес еще не добавлен — укажи его, чтобы быстрее оформлять заказы.</p>
          )}
          <Link href="/myprofile/addresses" className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">{def ? "Управлять адресами" : "Добавить адрес"} <ArrowRight size={12} /></Link>
        </div>
        <div className="rounded-sm border border-gray-200 p-5">
          <p className="flex items-center gap-2 text-xsm font-bold uppercase tracking-wider text-gray-500"><Heart size={14} /> Избранное</p>
          <p className="mt-3 text-sm text-gray-900">Сохраняй понравившиеся товары и возвращайся к ним с любого устройства.</p>
          <Link href="/wishlist" className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">Открыть избранное <ArrowRight size={12} /></Link>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
        <LogoutButton className="btn-outline h-10 px-6 text-xsm">Выйти</LogoutButton>
      </div>
    </AccountShell>
  );
}

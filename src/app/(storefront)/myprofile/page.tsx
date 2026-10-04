import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { redirect } from "next/navigation";
import { Package, MapPin, Gift, Heart, ArrowRight } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { getCustomerToken } from "@/lib/auth/session";
import { orderStatus } from "@/lib/account";
import { formatMoney } from "@/lib/utils";
import AuthForm from "@/components/account/AuthForm";
import AccountShell from "@/components/account/AccountShell";
import LogoutButton from "@/components/account/LogoutButton";
import { getT, localized } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Профиль"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const token = await getCustomerToken();
  const { next } = await searchParams;
  const catalog = await getCatalog();
  const customer = token ? await catalog.getCustomer(token).catch(() => null) : null;
  const { t, locale } = await getT();
  const dl = locale === "ka" ? "ka-GE" : locale === "en" ? "en-GB" : "ru-RU";

  if (!customer) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <h1 className="text-center text-2xl font-normal">{t("Вход")}</h1>
        <p className="mt-2 text-center text-sm text-gray-500">{t("Войди, чтобы видеть заказы, бонусы и избранное")}</p>
        <AuthForm mode="login" next={next} />
        <p className="mt-6 text-center text-sm">
          {t("Нет аккаунта?")} <Link href="/myprofile/register" className="underline underline-offset-4">{t("Зарегистрироваться")}</Link>
        </p>
      </div>
    );
  }
  if (next && next.startsWith("/") && !next.startsWith("/myprofile")) redirect(await localized(next));

  const orders = await catalog.getCustomerOrders(token!).catch(() => []);
  const last = orders[0];
  const addresses = customer.addresses ?? [];
  const def = addresses.find((a) => a.isDefault) ?? addresses[0];
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;

  return (
    <AccountShell title={customer.firstName ? t("Привет, {name}!", { name: customer.firstName }) : t("Привет!")} subtitle={customer.email} name={name}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm bg-pale-pink p-5">
          <p className="flex items-center gap-2 text-xsm font-bold uppercase tracking-wider text-badge"><Gift size={14} /> Merey Club</p>
          <p className="mt-3 text-3xl font-bold">{customer.bonusBalance ?? 0} <span className="text-base font-normal">{t("бонусов")}</span></p>
          <p className="mt-1 text-xsm text-gray-900">{t("1 бонус = 1 ₾. Оплачивай бонусами до 30% заказа.")}</p>
          <Link href="/bonuses" className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">{t("История начислений")} <ArrowRight size={12} /></Link>
        </div>
        <div className="rounded-sm border border-gray-200 p-5">
          <p className="flex items-center gap-2 text-xsm font-bold uppercase tracking-wider text-gray-500"><Package size={14} /> {t("Последний заказ")}</p>
          {last ? (
            <>
              <p className="mt-3 text-sm font-bold">{t("Заказ №{n}", { n: last.orderNumber })}</p>
              <p className="text-xsm text-gray-500">{new Date(last.processedAt).toLocaleDateString(dl)} · {t(orderStatus(last))} · {formatMoney(last.totalPrice)}</p>
              <p className="mt-2 line-clamp-2 text-xsm">{last.lineItems.map((li) => li.title).join(", ")}</p>
              <Link href={`/orders/${encodeURIComponent(last.id.split("/").pop() ?? last.id)}`} className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">{t("Подробнее")} <ArrowRight size={12} /></Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-gray-900">{t("Заказов пока нет.")}</p>
              <Link href="/women" className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">{t("К покупкам")} <ArrowRight size={12} /></Link>
            </>
          )}
        </div>
        <div className="rounded-sm border border-gray-200 p-5">
          <p className="flex items-center gap-2 text-xsm font-bold uppercase tracking-wider text-gray-500"><MapPin size={14} /> {t("Адрес доставки")}</p>
          {def ? (
            <p className="mt-3 text-sm leading-6">{[def.firstName, def.lastName].filter(Boolean).join(" ")}<br />{def.address1}{def.address2 ? `, ${def.address2}` : ""}<br />{def.zip ? `${def.zip}, ` : ""}{def.city}</p>
          ) : (
            <p className="mt-3 text-sm text-gray-900">{t("Адрес еще не добавлен — укажи его, чтобы быстрее оформлять заказы.")}</p>
          )}
          <Link href="/myprofile/addresses" className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">{def ? t("Управлять адресами") : t("Добавить адрес")} <ArrowRight size={12} /></Link>
        </div>
        <div className="rounded-sm border border-gray-200 p-5">
          <p className="flex items-center gap-2 text-xsm font-bold uppercase tracking-wider text-gray-500"><Heart size={14} /> {t("Избранное")}</p>
          <p className="mt-3 text-sm text-gray-900">{t("Сохраняй понравившиеся товары и возвращайся к ним с любого устройства.")}</p>
          <Link href="/wishlist" className="mt-4 inline-flex items-center gap-1 text-xsm underline underline-offset-4">{t("Открыть избранное")} <ArrowRight size={12} /></Link>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
        <LogoutButton className="btn-outline h-10 px-6 text-xsm">{t("Выйти")}</LogoutButton>
      </div>
    </AccountShell>
  );
}

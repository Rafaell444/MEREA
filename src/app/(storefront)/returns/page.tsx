import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { optionalCustomer } from "@/lib/account";
import { getCustomerToken } from "@/lib/auth/session";
import { getSettings } from "@/lib/cms/content";
import AccountShell from "@/components/account/AccountShell";
import ReturnForm from "@/components/account/ReturnForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Возврат товара") };
}
export const dynamic = "force-dynamic";

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const { t } = await getT();
  const [customer, settings, token] = await Promise.all([optionalCustomer(), getSettings(), getCustomerToken()]);
  const catalog = await getCatalog();
  const orders = customer && token ? await catalog.getCustomerOrders(token).catch(() => []) : [];
  const eligible = orders.filter((o) => o.fulfillmentStatus === "FULFILLED").map((o) => ({ orderNumber: String(o.orderNumber), items: o.lineItems.map((li) => ({ title: li.title, quantity: li.quantity })) }));
  const form = <ReturnForm email={customer?.email ?? ""} orders={eligible} preselect={order} returnDays={settings.returnDays} />;

  if (customer) {
    return (
      <AccountShell title={t("Возвраты")} subtitle={t("Вернуть товар можно в течение {n} дней с момента получения", { n: settings.returnDays })} name={customer.email}>
        {form}
      </AccountShell>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-normal sm:text-[32px]">{t("Возврат товара")}</h1>
      <p className="mt-2 text-sm text-gray-500">{t("Вернуть товар можно в течение {n} дней. Укажи номер заказа и e-mail покупателя.", { n: settings.returnDays })}</p>
      <div className="mt-6">{form}</div>
    </div>
  );
}

import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { optionalCustomer } from "@/lib/account";
import { getCustomerToken } from "@/lib/auth/session";
import { getSettings } from "@/lib/cms/content";
import AccountShell from "@/components/account/AccountShell";
import ReturnForm from "@/components/account/ReturnForm";

export const metadata: Metadata = { title: "Возврат товара" };
export const dynamic = "force-dynamic";

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const [customer, settings, token] = await Promise.all([optionalCustomer(), getSettings(), getCustomerToken()]);
  const catalog = await getCatalog();
  const orders = customer && token ? await catalog.getCustomerOrders(token).catch(() => []) : [];
  const eligible = orders.filter((o) => o.fulfillmentStatus === "FULFILLED").map((o) => ({ orderNumber: String(o.orderNumber), items: o.lineItems.map((li) => ({ title: li.title, quantity: li.quantity })) }));
  const form = <ReturnForm email={customer?.email ?? ""} orders={eligible} preselect={order} returnDays={settings.returnDays} />;

  if (customer) {
    return (
      <AccountShell title="Возвраты" subtitle={`Вернуть товар можно в течение ${settings.returnDays} дней с момента получения`} name={customer.email}>
        {form}
      </AccountShell>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-normal sm:text-[32px]">Возврат товара</h1>
      <p className="mt-2 text-sm text-gray-500">Вернуть товар можно в течение {settings.returnDays} дней. Укажи номер заказа и e-mail покупателя.</p>
      <div className="mt-6">{form}</div>
    </div>
  );
}

import type { Metadata } from "next";
import OrderStatusForm from "@/components/account/OrderStatusForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Отследить заказ") };
}

export default async function OrderStatusPage() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <h1 className="text-center text-2xl font-normal">{t("Отследить заказ / возврат")}</h1>
      <p className="mt-2 text-center text-sm text-gray-500">{t("Введи номер заказа и e-mail, указанный при оформлении")}</p>
      <OrderStatusForm />
    </div>
  );
}

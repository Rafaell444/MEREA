import type { Metadata } from "next";
import OrderStatusForm from "@/components/account/OrderStatusForm";

export const metadata: Metadata = { title: "Отследить заказ" };

export default function OrderStatusPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <h1 className="text-center text-2xl font-normal">Отследить заказ / возврат</h1>
      <p className="mt-2 text-center text-sm text-gray-500">Введи номер заказа и e-mail, указанный при оформлении</p>
      <OrderStatusForm />
    </div>
  );
}

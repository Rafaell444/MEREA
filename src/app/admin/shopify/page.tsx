import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import ShopifyPanel from "@/components/admin/ShopifyPanel";

export default async function ShopifyAdminPage() {
  const session = (await getAdminSession())!;
  if (!["owner", "admin"].includes(session.role)) notFound();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-2xl font-bold">Shopify</h1>
      <p className="mb-6 max-w-3xl text-xsm text-gray-500">
        Статус подключения, коллекции магазина и их привязка к страницам каталога. Ключи хранятся только в файле <code>.env</code> на сервере.
      </p>
      <ShopifyPanel />
    </div>
  );
}

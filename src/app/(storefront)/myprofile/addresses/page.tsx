import type { Metadata } from "next";
import { requireCustomer } from "@/lib/account";
import AccountShell from "@/components/account/AccountShell";
import AddressBook from "@/components/account/AddressBook";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Адреса доставки"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const { customer } = await requireCustomer("/myprofile/addresses");
  const { t } = await getT();
  return (
    <AccountShell title={t("Адреса доставки")} subtitle={t("Сохраненные адреса подставляются при оформлении заказа")} name={customer.email}>
      <AddressBook addresses={customer.addresses ?? []} customer={{ firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone }} />
    </AccountShell>
  );
}

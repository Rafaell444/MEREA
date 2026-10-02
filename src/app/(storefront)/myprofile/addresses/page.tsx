import type { Metadata } from "next";
import { requireCustomer } from "@/lib/account";
import AccountShell from "@/components/account/AccountShell";
import AddressBook from "@/components/account/AddressBook";

export const metadata: Metadata = { title: "Адреса доставки", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const { customer } = await requireCustomer("/myprofile/addresses");
  return (
    <AccountShell title="Адреса доставки" subtitle="Сохраненные адреса подставляются при оформлении заказа" name={customer.email}>
      <AddressBook addresses={customer.addresses ?? []} customer={{ firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone }} />
    </AccountShell>
  );
}

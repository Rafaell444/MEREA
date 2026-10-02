import type { Metadata } from "next";
import { requireCustomer } from "@/lib/account";
import AccountShell from "@/components/account/AccountShell";
import PersonalForm from "@/components/account/PersonalForm";

export const metadata: Metadata = { title: "Личные данные", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PersonalPage() {
  const { customer } = await requireCustomer("/myprofile/personal");
  return (
    <AccountShell title="Личные данные" subtitle="Имя, контакты, дата рождения и пароль" name={customer.email}>
      <PersonalForm customer={customer} />
    </AccountShell>
  );
}

import type { Metadata } from "next";
import { requireCustomer } from "@/lib/account";
import AccountShell from "@/components/account/AccountShell";
import PersonalForm from "@/components/account/PersonalForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Личные данные"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function PersonalPage() {
  const { customer } = await requireCustomer("/myprofile/personal");
  const { t } = await getT();
  return (
    <AccountShell title={t("Личные данные")} subtitle={t("Имя, контакты, дата рождения и пароль")} name={customer.email}>
      <PersonalForm customer={customer} />
    </AccountShell>
  );
}

import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import AuthForm from "@/components/account/AuthForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Регистрация"), robots: { index: false } };
}

export default async function RegisterPage() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <h1 className="text-center text-2xl font-normal">{t("Регистрация")}</h1>
      <p className="mt-2 text-center text-sm text-gray-500">{t("-10% на первый заказ и бонусы за каждую покупку")}</p>
      <AuthForm mode="register" />
      <p className="mt-6 text-center text-sm">
        {t("Уже есть аккаунт?")} <Link href="/myprofile" className="underline underline-offset-4">{t("Войти")}</Link>
      </p>
    </div>
  );
}

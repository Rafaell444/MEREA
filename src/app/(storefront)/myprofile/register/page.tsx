import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/account/AuthForm";

export const metadata: Metadata = { title: "Регистрация", robots: { index: false } };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <h1 className="text-center text-2xl font-normal">Регистрация</h1>
      <p className="mt-2 text-center text-sm text-gray-500">-10% на первый заказ и бонусы за каждую покупку</p>
      <AuthForm mode="register" />
      <p className="mt-6 text-center text-sm">
        Уже есть аккаунт? <Link href="/myprofile" className="underline underline-offset-4">Войти</Link>
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Вход в админ-панель" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getAdminSession();
  const { next } = await searchParams;
  if (session) redirect(next && next.startsWith("/admin") ? next : "/admin");
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-sm border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-center text-xl font-bold tracking-[0.12em]">MEREA</p>
        <p className="mb-6 mt-1 text-center text-xsm text-gray-500">Панель управления сайтом</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}

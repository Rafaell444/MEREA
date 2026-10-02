import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/session";
import Sidebar from "@/components/admin/Sidebar";
import { catalogMode } from "@/lib/catalog";

export const metadata: Metadata = { title: { default: "Админ-панель", template: "%s · Админ Merea" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <div className="min-h-screen bg-off-white">{children}</div>;
  return (
    <div className="flex min-h-screen bg-off-white text-black">
      <Sidebar user={session} mode={catalogMode()} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

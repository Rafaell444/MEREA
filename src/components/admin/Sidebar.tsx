"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { MODELS, roleCan } from "@/lib/admin/registry";
import { cn } from "@/lib/utils";

const GROUPS: { key: string; label: string }[] = [
  { key: "content", label: "Контент" },
  { key: "catalog", label: "Каталог" },
  { key: "marketing", label: "Маркетинг" },
  { key: "inbox", label: "Входящие" },
  { key: "system", label: "Система" },
];

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name] ?? Icons.Circle;
  return <C size={size} strokeWidth={1.5} />;
}

export default function Sidebar({ user, mode }: { user: { name: string; email: string; role: string }; mode: "shopify" | "mock" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const item = (href: string, label: string, icon: string) => {
    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
    return (
      <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors", active ? "bg-black text-white" : "text-gray-900 hover:bg-gray-200")}>
        <Icon name={icon} /> {label}
      </Link>
    );
  };

  return (
    <>
      <button onClick={() => setOpen((v) => !v)} className="fixed left-3 top-3 z-50 rounded-sm bg-white p-2 shadow lg:hidden" aria-label="Меню">
        <Icons.Menu size={18} />
      </button>
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white px-4 py-5 transition-transform lg:static lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-5 flex items-center justify-between px-2">
          <Link href="/admin" className="text-lg font-bold tracking-[0.12em]">MEREA <span className="text-xs font-medium tracking-normal text-gray-500">admin</span></Link>
        </div>
        <div className={cn("mb-4 rounded-sm px-3 py-2 text-xsm", mode === "shopify" ? "bg-success/10 text-success" : "bg-pale-pink text-badge")}>
          {mode === "shopify" ? "Подключено к Shopify" : "Демо-каталог (Shopify не подключен)"}
        </div>
        <nav className="space-y-5">
          <div className="space-y-1">
            {item("/admin", "Дашборд", "LayoutDashboard")}
            {["owner", "admin"].includes(user.role) && item("/admin/settings", "Настройки сайта", "Settings")}
            {["owner", "admin"].includes(user.role) && item("/admin/shopify", "Shopify", "Plug")}
            {["owner", "admin"].includes(user.role) && item("/admin/orders", "Заказы (Shopify)", "ShoppingBag")}
            {["owner", "admin"].includes(user.role) && item("/admin/customers", "Клиенты (Shopify)", "UserRound")}
          </div>
          {GROUPS.map((g) => {
            const models = MODELS.filter((m) => m.group === g.key && roleCan(user.role, m, "read"));
            if (!models.length) return null;
            return (
              <div key={g.key}>
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">{g.label}</p>
                <div className="space-y-0.5">{models.map((m) => item(`/admin/${m.key}`, m.labelPlural, m.icon))}</div>
              </div>
            );
          })}
          <div className="space-y-1">
            {["owner", "admin"].includes(user.role) && item("/admin/audit", "Журнал действий", "History")}
            <a href="/" target="_blank" className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-gray-200"><Icons.ExternalLink size={16} strokeWidth={1.5} /> Открыть сайт</a>
          </div>
        </nav>
        <div className="mt-8 border-t border-gray-200 pt-4 text-xsm text-gray-500">
          <p className="font-medium text-black">{user.name}</p>
          <p>{user.email} · {user.role}</p>
          <form action="/api/admin/logout" method="post" className="mt-2">
            <button className="flex items-center gap-1 underline underline-offset-2"><Icons.LogOut size={12} /> Выйти</button>
          </form>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}

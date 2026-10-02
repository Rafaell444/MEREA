"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, Gift, RotateCcw, Settings, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/myprofile", label: "Обзор", icon: User, exact: true },
  { href: "/orders", label: "Мои заказы", icon: Package },
  { href: "/returns", label: "Возвраты", icon: RotateCcw },
  { href: "/myprofile/personal", label: "Личные данные", icon: Settings },
  { href: "/myprofile/addresses", label: "Адреса доставки", icon: MapPin },
  { href: "/bonuses", label: "Бонусы и программа лояльности", icon: Gift },
  { href: "/wishlist", label: "Избранное", icon: Heart },
  { href: "/myprofile/gift-cards", label: "Подарочные карты", icon: CreditCard },
];

/** Account area layout: sticky side nav on desktop, scrollable tab strip on mobile. */
export default function AccountShell({ title, subtitle, children, name }: { title: string; subtitle?: string; children: React.ReactNode; name?: string }) {
  const pathname = usePathname();
  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-normal sm:text-[32px]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {name && <p className="text-xsm text-gray-500">Аккаунт: <span className="font-medium text-black">{name}</span></p>}
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Личный кабинет" className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:sticky lg:top-24 lg:self-start">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 text-xsm transition-colors lg:rounded-sm lg:border-transparent lg:px-3", active ? "border-black bg-black text-white lg:bg-off-white lg:text-black lg:font-medium" : "border-gray-300 hover:border-black lg:hover:bg-off-white")}>
                <Icon size={16} strokeWidth={1.5} /> {label}
              </Link>
            );
          })}
          <LogoutButton className="hidden items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-xsm text-gray-500 hover:bg-off-white lg:flex"><LogOut size={16} strokeWidth={1.5} /> Выйти</LogoutButton>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

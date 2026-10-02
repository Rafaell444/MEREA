"use client";
import Link from "next/link";
import { ArrowRight, Gift, User, Package, Heart, MapPin, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Me = { email: string; firstName?: string } | null;

export default function AccountMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [me, setMe] = useState<Me | undefined>(undefined);
  useEffect(() => {
    if (!open || me !== undefined) return;
    fetch("/api/auth/me").then((r) => r.json()).then((j) => setMe(j.customer ?? null)).catch(() => setMe(null));
  }, [open, me]);

  const items = [
    { href: "/bonuses", label: "Программа лояльности", icon: Gift, pink: true },
    { href: "/myprofile", label: "Профиль", icon: User },
    { href: "/orders", label: "Заказы", icon: Package },
    { href: "/wishlist", label: "Избранное", icon: Heart },
    { href: "/stores", label: "Магазины", icon: MapPin },
  ];

  return (
    <div className={cn("absolute right-0 top-full z-[72] w-[313px] overflow-hidden pt-4 transition-all duration-300", open ? "visible opacity-100" : "pointer-events-none invisible opacity-0")}>
      <div className={cn("border border-gray-200 bg-white text-black shadow-xl transition-transform duration-300", open ? "translate-x-0" : "translate-x-6")}>
        {!me && (
          <div className="flex flex-col gap-2 px-6 pb-4 pt-6">
            <Link href="/myprofile" onClick={onClose} className="btn-primary h-10 w-full text-xsm">Вход</Link>
            <Link href="/myprofile/register" onClick={onClose} className="btn-outline h-10 w-full text-xsm">Регистрация</Link>
          </div>
        )}
        {me && (
          <div className="px-6 pb-2 pt-6">
            <p className="text-sm font-bold">Привет{me.firstName ? `, ${me.firstName}` : ""}!</p>
            <p className="text-xsm text-gray-500">{me.email}</p>
          </div>
        )}
        <ul>
          {items.map(({ href, label, icon: Icon, pink }) => (
            <li key={href} className={cn("px-6 py-4", pink && "bg-pale-pink")}>
              <Link href={href} onClick={onClose} className="group/link flex items-center gap-2">
                <Icon size={22} strokeWidth={1.5} className="shrink-0" />
                <span className="text-sm">{label}</span>
                <ArrowRight size={12} className="ml-auto opacity-0 transition-all duration-500 group-hover/link:opacity-100 group-hover/link:translate-x-0.5" />
              </Link>
            </li>
          ))}
          {me && (
            <li className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setMe(null); onClose(); location.href = "/"; }}
                className="group/link flex w-full items-center gap-2 text-left"
              >
                <LogOut size={22} strokeWidth={1.5} /> <span className="text-sm">Выйти</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

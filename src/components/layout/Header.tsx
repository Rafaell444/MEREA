"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, User, ShoppingBag, Menu as MenuIcon } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import AccountMenu from "./AccountMenu";

export type HeaderMenu = { key: string; label: string };

type Props = { menus: HeaderMenu[]; logo?: string; transparentOnHome?: boolean };

export default function Header({ menus, logo, transparentOnHome = true }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { open, drawer, setMenuTab } = useUI();
  const cart = useCart((s) => s.cart);
  const initCart = useCart((s) => s.init);
  const wishCount = useWishlist((s) => s.handles.length);

  useEffect(() => { initCart(); }, [initCart]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = transparentOnHome && isHome && !scrolled && !drawer;
  const fg = transparent ? "text-white" : "text-black";
  const qty = cart?.totalQuantity ?? 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-[70] w-full transition-colors duration-500",
        transparent ? "bg-transparent bg-gradient-to-b from-black/35 to-transparent" : "bg-white border-b border-gray-200",
        isHome && transparentOnHome && "max-sm:bg-white max-sm:text-black",
      )}
      style={{ ["--header-h" as string]: "56px" }}
    >
      <nav className="relative h-[56px]">
        <div className="flex h-full items-center px-4 sm:px-10">
          {/* Left: nav */}
          <div className="flex w-3/12 items-center justify-start sm:w-4/12">
            <div className="flex items-center gap-4 sm:hidden">
              <button aria-label="Меню" onClick={() => open("menu")} className="flex">
                <MenuIcon size={24} strokeWidth={1.5} className={cn("max-sm:text-black", fg)} />
              </button>
              <button aria-label="Поиск" onClick={() => open("search")} className="flex">
                <Search size={24} strokeWidth={1.5} className={cn("max-sm:text-black", fg)} />
              </button>
            </div>
            <ul className="hidden gap-3 sm:flex lg:gap-6">
              {menus.map((m) => (
                <li key={m.key}>
                  <button
                    onClick={() => { setMenuTab(m.key); open("menu"); }}
                    onMouseEnter={() => { if (window.matchMedia("(hover: hover)").matches) { setMenuTab(m.key); open("menu"); } }}
                    className={cn("group relative z-[71] block cursor-pointer text-sm font-bold uppercase transition-colors duration-500", fg)}
                  >
                    {m.label}
                    <span className={cn("pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-[13px] -translate-x-1/2 rounded-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100", transparent ? "bg-white" : "bg-black")} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Center: logo */}
          <div className="flex w-6/12 justify-center sm:w-4/12">
            <Logo src={logo} invert={transparent} className="max-sm:[&_img]:invert-0 max-sm:[&_span]:text-black" />
          </div>

          {/* Right: icons */}
          <div className="flex w-3/12 justify-end sm:w-4/12">
            <div className={cn("flex items-center gap-4 sm:gap-6 transition-colors duration-500 max-sm:text-black", fg)}>
              <button aria-label="Поиск" onClick={() => open("search")} className="hidden sm:flex transition-transform hover:scale-110">
                <Search size={24} strokeWidth={1.5} />
              </button>
              <Link href="/wishlist" aria-label="Избранное" className="relative hidden sm:flex transition-transform hover:scale-110">
                <Heart size={24} strokeWidth={1.5} />
                {wishCount > 0 && <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">{wishCount}</span>}
              </Link>
              <div className="relative" onMouseEnter={() => setAccountOpen(true)} onMouseLeave={() => setAccountOpen(false)}>
                <Link href="/myprofile" aria-label="Профиль" className="relative flex transition-transform hover:scale-110">
                  <User size={24} strokeWidth={1.5} />
                  <span className={cn("absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black opacity-0 transition-opacity", accountOpen && "opacity-100", transparent && "bg-white")} />
                </Link>
                <AccountMenu open={accountOpen} onClose={() => setAccountOpen(false)} />
              </div>
              <button aria-label="Корзина" onClick={() => open("cart")} className="relative flex transition-transform hover:scale-110">
                <ShoppingBag size={24} strokeWidth={1.5} />
                {qty > 0 && <span className={cn("absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold", transparent ? "bg-white text-black max-sm:bg-black max-sm:text-white" : "bg-black text-white")}>{qty}</span>}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

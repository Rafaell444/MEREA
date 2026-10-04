"use client";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, localizePath, splitLocale, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Language menu (ქართული / English / Русский). Switching keeps the current page and query string. */
export default function LanguageSwitcher({ className, variant = "header", light }: { className?: string; variant?: "header" | "footer" | "inline"; light?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const { path } = splitLocale(pathname);
  const qs = search?.toString();
  const hrefFor = (l: Locale) => `${localizePath(path, l)}${qs ? `?${qs}` : ""}`;
  // full page navigation so the server re-renders every string and sets the `lang` cookie
  const go = (l: Locale) => { document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`; window.location.href = hrefFor(l); };

  if (variant === "inline") {
    return (
      <div className={cn("flex gap-2", className)}>
        {LOCALES.map((l) => (
          <button key={l} onClick={() => go(l)} className={cn("rounded-full border px-4 py-2 text-xsm transition-colors", l === locale ? "border-black bg-black text-white" : "border-gray-300 hover:border-black")}>{LOCALE_NAMES[l]}</button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen((v) => !v)} onMouseEnter={() => setOpen(true)} aria-haspopup="listbox" aria-expanded={open} aria-label="Language" className={cn("flex items-center gap-1.5 text-xsm font-medium uppercase transition-colors", light && "text-white")}>
        <Globe size={variant === "footer" ? 14 : 18} strokeWidth={1.5} /> {variant === "footer" ? LOCALE_NAMES[locale] : LOCALE_SHORT[locale]}
      </button>
      <ul role="listbox" className={cn("absolute z-[75] min-w-[150px] border border-gray-200 bg-white py-1 text-black shadow-xl transition-all duration-200", variant === "footer" ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2", open ? "visible opacity-100" : "pointer-events-none invisible opacity-0")}>
        {LOCALES.map((l) => (
          <li key={l} role="option" aria-selected={l === locale}>
            <a href={hrefFor(l)} onClick={(e) => { e.preventDefault(); go(l); }} hrefLang={l} className="flex items-center justify-between gap-3 px-4 py-2 text-xsm hover:bg-off-white">
              {LOCALE_NAMES[l]} {l === locale && <Check size={12} />}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

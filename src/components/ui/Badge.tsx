"use client";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

export function PromoBadge({ label, textColor = "#80251D", bgColor = "#FFFFFF", className }: { label: string; textColor?: string; bgColor?: string; className?: string }) {
  const t = useT();
  return (
    <span
      className={cn("inline-flex w-fit items-center rounded-xs border border-black/10 px-2 py-1 text-xs font-medium leading-none sm:text-xsm sm:px-3", className)}
      style={{ color: textColor, backgroundColor: bgColor }}
    >
      {t(label)}
    </span>
  );
}

export function MenuBadge({ text, color = "#000000" }: { text: string; color?: string }) {
  const t = useT();
  return (
    <span
      className="ml-2 inline-flex h-[18px] items-center rounded-xs border px-1.5 text-[10px] font-medium uppercase leading-none whitespace-nowrap"
      style={{ color, borderColor: color, backgroundColor: `${color}1a` }}
    >
      {t(text)}
    </span>
  );
}

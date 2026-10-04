"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

type Props = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right" | "bottom";
  title?: React.ReactNode;
  width?: string; // tailwind width class
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  hideHeader?: boolean;
  overlayClassName?: string;
  topOffset?: boolean; // start below the header (desktop menu style)
};

/** Scroll-lock helper shared by Drawer and Modal */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPad;
    };
  }, [active]);
}

export default function Drawer({ open, onClose, side = "right", title, width = "w-full sm:w-[420px]", children, className, bodyClassName, hideHeader, overlayClassName, topOffset }: Props) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const anim = side === "left" ? "animate-slide-in-left" : side === "right" ? "animate-slide-in-right" : "animate-slide-up";
  const pos = side === "left" ? "left-0 top-0 h-full" : side === "right" ? "right-0 top-0 h-full" : "left-0 right-0 bottom-0 max-h-[90vh] rounded-t-2xl";

  return (
    <div className={cn("fixed inset-0 z-[80]", topOffset && "sm:top-[var(--header-h,87px)]")} role="dialog" aria-modal="true">
      <div className={cn("absolute inset-0 bg-black/30 animate-fade-in", overlayClassName)} onClick={onClose} />
      <div
        ref={ref}
        className={cn("absolute flex flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,.15)]", pos, width, anim, className)}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div className="text-sm font-bold">{title}</div>
            <button aria-label={t("Закрыть")} onClick={onClose} className="p-1 -mr-1 transition-transform hover:rotate-90 duration-300">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div className={cn("flex-1 overflow-y-auto custom-scrollbar", bodyClassName)}>{children}</div>
      </div>
    </div>
  );
}

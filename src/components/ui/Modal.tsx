"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "./Drawer";

type Props = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  closable?: boolean;
  blur?: boolean;
  size?: "sm" | "md" | "lg";
};

export default function Modal({ open, onClose, children, className, closable = true, blur = true, size = "md" }: Props) {
  useScrollLock(open);
  useEffect(() => {
    if (!open || !closable) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closable, onClose]);
  if (!open) return null;
  const w = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className={cn("absolute inset-0 bg-black/30 animate-fade-in", blur && "backdrop-blur-md")} onClick={closable ? onClose : undefined} />
      <div className={cn("relative w-full bg-white rounded-sm shadow-2xl animate-scale-in", w, className)}>
        {closable && onClose && (
          <button aria-label="Закрыть" onClick={onClose} className="absolute right-3 top-3 z-10 p-1 text-gray-500 hover:text-black transition-transform hover:rotate-90 duration-300">
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

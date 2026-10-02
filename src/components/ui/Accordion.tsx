"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { id: string; title: React.ReactNode; content: React.ReactNode; defaultOpen?: boolean };

export function AccordionItem({ title, children, defaultOpen = false, className, titleClassName }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; className?: string; titleClassName?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("border-b border-gray-300", className)}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={cn("flex w-full items-center justify-between py-4 text-left text-sm font-medium", titleClassName)} aria-expanded={open}>
        <span>{title}</span>
        <ChevronDown size={16} strokeWidth={1.5} className={cn("transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="pb-5 text-sm leading-6 text-gray-900">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Accordion({ items, className }: { items: Item[]; className?: string }) {
  return (
    <div className={className}>
      {items.map((it) => (
        <AccordionItem key={it.id} title={it.title} defaultOpen={it.defaultOpen}>
          {it.content}
        </AccordionItem>
      ))}
    </div>
  );
}

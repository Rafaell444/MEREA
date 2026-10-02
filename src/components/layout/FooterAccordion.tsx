"use client";
import Link from "next/link";
import { AccordionItem } from "@/components/ui/Accordion";
import type { FooterColumn } from "@/lib/cms/content";

export default function FooterAccordion({ columns }: { columns: FooterColumn[] }) {
  return (
    <div>
      {columns.map((col) => (
        <AccordionItem key={col.title} title={<span className="uppercase text-sm font-bold">{col.title}</span>} className="px-4">
          <div className="flex flex-col gap-3">
            {col.links.map((l) => (
              <Link key={l.href + l.label} href={l.href} className="block text-sm text-black hover:underline">
                {l.label}
              </Link>
            ))}
          </div>
        </AccordionItem>
      ))}
    </div>
  );
}

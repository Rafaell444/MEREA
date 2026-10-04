"use client";
import Link from "@/components/ui/Link";
import { AccordionItem } from "@/components/ui/Accordion";
import { useT } from "@/lib/i18n/client";
import type { FooterColumn } from "@/lib/cms/content";

export default function FooterAccordion({ columns }: { columns: FooterColumn[] }) {
  const t = useT();
  return (
    <div>
      {columns.map((col) => (
        <AccordionItem key={col.title} title={<span className="uppercase text-sm font-bold">{t(col.title)}</span>} className="px-4">
          <div className="flex flex-col gap-3">
            {col.links.map((l) => (
              <Link key={l.href + l.label} href={l.href} className="block text-sm text-black hover:underline">
                {t(l.label)}
              </Link>
            ))}
          </div>
        </AccordionItem>
      ))}
    </div>
  );
}

"use client";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import type { SizeGuide } from "@/lib/cms/content";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";
import { useT } from "@/lib/i18n/client";

export default function SizeGuideDrawer({ guides }: { guides: SizeGuide[] }) {
  const t = useT();
  const { drawer, close, drawerPayload } = useUI();
  const open = drawer === "sizeGuide";
  const wanted = (drawerPayload as { key?: string } | null)?.key;
  const [tab, setTab] = useState<string | null>(null);
  const activeKey = tab ?? wanted ?? guides[0]?.key;
  const guide = guides.find((g) => g.key === activeKey) ?? guides[0];

  return (
    <Drawer open={open} onClose={() => { close(); setTab(null); }} side="right" title={t("Таблица размеров")} width="w-full sm:w-[520px]">
      <div className="px-6 py-5">
        <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto">
          {guides.map((g) => (
            <button key={g.key} onClick={() => setTab(g.key)} className={cn("whitespace-nowrap rounded-full border px-4 py-1.5 text-xsm transition-colors", g.key === guide?.key ? "border-black bg-black text-white" : "border-gray-300 hover:border-black")}>
              {t(g.title)}
            </button>
          ))}
        </div>
        {guide && (
          <div className="animate-fade-in">
            {guide.content.note && <p className="mb-4 text-sm text-gray-900">{t(guide.content.note)}</p>}
            <table className="w-full border-collapse text-xsm">
              <thead>
                <tr>{guide.content.columns.map((c) => <th key={c} className="border border-gray-300 bg-off-white px-2 py-2 font-bold">{t(c)}</th>)}</tr>
              </thead>
              <tbody>
                {guide.content.rows.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-off-white/50">{r.map((cell, j) => <td key={j} className={cn("border border-gray-300 px-2 py-2 text-center", j === 0 && "font-medium")}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 space-y-2 text-xsm text-gray-500">
              <p><strong className="text-black">{t("Как измерить:")}</strong> {t("стой прямо, сантиметровая лента должна прилегать к телу, но не сдавливать.")}</p>
              <p>{t("Если ты между размерами — выбирай больший для одежды и меньший пояс / большую чашку для бюстгальтеров.")}</p>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

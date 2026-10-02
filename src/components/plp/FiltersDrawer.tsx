"use client";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, SlidersHorizontal, Palette, Ruler, Layers, Tag, Check } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import { AccordionItem } from "@/components/ui/Accordion";
import type { ProductFilter, SortKey } from "@/lib/catalog/types";
import { cn, productsLabel } from "@/lib/utils";
import { useUI } from "@/store/ui";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "RELEVANCE", label: "По популярности" },
  { key: "CREATED", label: "Сначала новинки" },
  { key: "PRICE_ASC", label: "Цена: по возрастанию" },
  { key: "PRICE_DESC", label: "Цена: по убыванию" },
];

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  color: Palette, size: Ruler, material: Layers, price: Tag,
};

function keyOf(id: string) {
  // Shopify ids look like "filter.v.option.color" / "filter.p.product_type"; mock uses plain keys
  const parts = id.split(".");
  return parts[parts.length - 1] || id;
}

/** "N товаров · Фильтры +" bar and the right-side sort & filter drawer. URL-driven (?sort=&f.color=…). */
export function FiltersBar({ total, filters }: { total: number; filters: ProductFilter[] }) {
  const { open } = useUI();
  const sp = useSearchParams();
  const activeCount = [...sp.keys()].filter((k) => k.startsWith("f.")).reduce((n, k) => n + sp.getAll(k).length, 0);
  return (
    <div className="flex justify-between py-5">
      <div className="flex-1 content-center">
        <p className="text-xs text-gray-500">{total >= 0 ? productsLabel(total) : ""}</p>
      </div>
      <div className="flex-1 text-right text-xsm">
        <button onClick={() => open("filters")} className="cursor-pointer font-medium text-black" disabled={!filters.length}>
          Фильтры{activeCount > 0 && <span className="ml-1 text-gray-500">({activeCount})</span>}
          <Plus size={10} className="ml-2 inline" />
        </button>
      </div>
    </div>
  );
}

export default function FiltersDrawer({ total, filters }: { total: number; filters: ProductFilter[] }) {
  const { drawer, close } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const open = drawer === "filters";

  const initial = useMemo(() => {
    const m: Record<string, string[]> = {};
    sp.forEach((v, k) => { if (k.startsWith("f.")) (m[k.slice(2)] ??= []).push(v); });
    return m;
  }, [sp]);
  const [sel, setSel] = useState<Record<string, string[]>>(initial);
  const [sort, setSort] = useState<SortKey>((sp.get("sort") as SortKey) || "RELEVANCE");

  function toggle(key: string, value: string, single = false) {
    setSel((s) => {
      const cur = s[key] ?? [];
      if (single) return { ...s, [key]: cur.includes(value) ? [] : [value] };
      return { ...s, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  }

  function apply() {
    const params = new URLSearchParams();
    if (sort !== "RELEVANCE") params.set("sort", sort);
    Object.entries(sel).forEach(([k, vs]) => vs.forEach((v) => params.append(`f.${k}`, v)));
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
    close();
  }
  function reset() {
    setSel({});
    setSort("RELEVANCE");
    router.push(pathname);
    close();
  }

  const count = Object.values(sel).reduce((n, v) => n + v.length, 0);

  return (
    <Drawer open={open} onClose={close} side="right" title="Сортировка и фильтры" width="w-full sm:w-[400px]">
      <div className="flex h-full flex-col">
        <div className="flex-1 px-6">
          <AccordionItem title={<span className="flex items-center gap-2"><SlidersHorizontal size={16} strokeWidth={1.5} /> Сортировать по</span>}>
            <ul className="space-y-3">
              {SORTS.map((s) => (
                <li key={s.key}>
                  <button onClick={() => setSort(s.key)} className="flex w-full items-center justify-between text-sm">
                    <span className={cn(sort === s.key && "font-medium")}>{s.label}</span>
                    <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", sort === s.key ? "border-black bg-black text-white" : "border-gray-300")}>{sort === s.key && <Check size={10} />}</span>
                  </button>
                </li>
              ))}
            </ul>
          </AccordionItem>
          <div className="h-6" />
          {filters.map((f) => {
            const key = keyOf(f.id);
            const Icon = ICONS[key] ?? Tag;
            const single = f.type === "PRICE_RANGE";
            return (
              <AccordionItem key={f.id} title={<span className="flex items-center gap-2"><Icon size={16} strokeWidth={1.5} /> {f.label}</span>}>
                <ul className={cn("flex flex-wrap gap-2", key === "size" && "gap-1.5")}>
                  {f.values.map((v) => {
                    const on = (sel[key] ?? []).includes(v.input);
                    const isColor = key === "color";
                    return (
                      <li key={v.id}>
                        <button
                          onClick={() => toggle(key, v.input, single)}
                          disabled={v.count === 0 && !on && f.type === "LIST"}
                          className={cn(
                            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xsm transition-colors disabled:opacity-40",
                            on ? "border-black bg-black text-white" : "border-gray-300 hover:border-black",
                          )}
                        >
                          {isColor && <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: v.hex ?? colorHex(v.label) }} />}
                          {v.label}
                          {f.type === "LIST" && v.count > 0 && <span className={cn("text-[10px]", on ? "text-white/70" : "text-gray-500")}>{v.count}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </AccordionItem>
            );
          })}
        </div>
        <div className="border-t border-gray-200 px-6 py-5">
          <button onClick={apply} className="btn-primary w-full">Посмотреть {total >= 0 ? `${total} результат${plural(total)}` : "результаты"}</button>
          <button onClick={reset} className="mt-3 w-full text-center text-xsm underline underline-offset-4">Очистить фильтры{count > 0 && ` (${count})`}</button>
        </div>
      </div>
    </Drawer>
  );
}

function plural(n: number) {
  const a = n % 100, b = n % 10;
  if (a > 10 && a < 20) return "ов";
  if (b > 1 && b < 5) return "а";
  if (b === 1) return "";
  return "ов";
}

function colorHex(label: string) {
  const map: Record<string, string> = { Черный: "#111", Белый: "#fff", Серый: "#9a9a9a", Бежевый: "#d9b69a", Розовый: "#e8a9bd", Бордовый: "#5c1d2a", Зеленый: "#5b6b4a", Синий: "#1d2a4a", Фиолетовый: "#b9a7d6", Коричневый: "#5a3a2e", Красный: "#c62828", Желтый: "#f0d35e" };
  return map[label] ?? "#ddd";
}

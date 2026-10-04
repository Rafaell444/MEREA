"use client";
import { useEffect, useState } from "react";
import Link from "@/components/ui/Link";
import { ChevronRight, ChevronLeft, Heart, Truck, Store, MessageCircle, X } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import { MenuBadge } from "@/components/ui/Badge";
import type { MenuNode } from "@/lib/cms/defaults";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";
import { useUI } from "@/store/ui";
import LanguageSwitcher from "./LanguageSwitcher";

export type MenusMap = Record<string, { label: string; items: MenuNode[] }>;

const SERVICE_ICONS = [Heart, Truck, Store, MessageCircle];

/** Left category drawer: level-1 list + sliding level-2 / level-3 panels (desktop), stacked navigation on mobile. */
export default function MenuDrawer({ menus, service }: { menus: MenusMap; service: MenuNode[] }) {
  const t = useT();
  const { drawer, close, menuTab, setMenuTab } = useUI();
  const open = drawer === "menu";
  const [l2, setL2] = useState<MenuNode | null>(null);
  const [l3, setL3] = useState<MenuNode | null>(null);
  const [mobileStack, setMobileStack] = useState<MenuNode[]>([]);

  useEffect(() => { if (!open) { setL2(null); setL3(null); setMobileStack([]); } }, [open]);
  useEffect(() => { setL2(null); setL3(null); setMobileStack([]); }, [menuTab]);

  const tabs = Object.entries(menus);
  const items = menus[menuTab]?.items ?? [];

  const Item = ({ node, active, onEnter, depth = 1 }: { node: MenuNode; active?: boolean; onEnter?: () => void; depth?: number }) => {
    const hasChildren = !!node.children?.length;
    const inner = (
      <>
        <p className={cn("truncate text-sm", depth === 1 ? "font-light" : "font-normal", active && "font-medium")} style={{ color: node.textColor ?? undefined }}>
          {t(node.label)}
          {node.badgeText && <MenuBadge text={node.badgeText} color={node.badgeColor ?? "#000"} />}
        </p>
        {hasChildren && <ChevronRight size={12} className={cn("ml-2 shrink-0 text-gray-400 transition-all duration-200", active ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0 group-hover/mi:translate-x-0 group-hover/mi:opacity-100")} />}
      </>
    );
    const cls = "group/mi flex min-w-0 w-full cursor-pointer items-center justify-between py-2 uppercase text-left transition-colors duration-200 hover:text-silver-grey";
    if (hasChildren) {
      return (
        <li>
          <button className={cls} onMouseEnter={onEnter} onClick={onEnter}>{inner}</button>
        </li>
      );
    }
    return (
      <li onMouseEnter={onEnter}>
        <Link href={node.href ?? "#"} onClick={close} className={cls}>{inner}</Link>
      </li>
    );
  };

  return (
    <Drawer open={open} onClose={close} side="left" hideHeader width="w-full sm:w-auto" className="sm:max-w-[1200px] overflow-visible" bodyClassName="overflow-visible">
      {/* ---------- Desktop ---------- */}
      <div className="hidden h-full sm:flex">
        {/* Level 1 */}
        <div className="custom-scrollbar flex h-full w-[420px] flex-col justify-between overflow-y-auto py-2 pl-10 pr-4">
          <div>
            <div className="flex items-center justify-between py-3 pr-2">
              <div className="flex gap-6">
                {tabs.map(([key, tab]) => (
                  <button key={key} onClick={() => setMenuTab(key)} className={cn("relative text-sm font-bold uppercase", menuTab === key ? "text-black" : "text-gray-400 hover:text-black")}>
                    {t(tab.label)}
                    {menuTab === key && <span className="absolute -bottom-1 left-1/2 h-0.5 w-[13px] -translate-x-1/2 rounded-sm bg-black" />}
                  </button>
                ))}
              </div>
              <button aria-label={t("Закрыть")} onClick={close} className="p-1 transition-transform duration-300 hover:rotate-90"><X size={18} strokeWidth={1.5} /></button>
            </div>
            <ul className="flex flex-col text-sm">
              {items.map((node) => (
                <Item key={node.label} node={node} active={l2?.label === node.label} onEnter={() => { setL2(node.children?.length ? node : null); setL3(null); }} />
              ))}
            </ul>
          </div>
          <ul className="flex flex-col gap-2.5 py-14">
            {service.map((s, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <li key={s.label}>
                  <Link href={s.href ?? "#"} onClick={close} className="flex items-center gap-2.5 text-sm font-medium hover:opacity-70">
                    <Icon size={20} strokeWidth={1.5} /> {t(s.label)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Level 2 */}
        <div className={cn("h-full border-l border-gray-200 bg-white transition-all duration-300 overflow-hidden", l2 ? "w-[360px] opacity-100" : "w-0 opacity-0")}>
          {l2 && (
            <ul className="custom-scrollbar flex h-full flex-col overflow-y-auto py-[62px] px-8 animate-fade-in">
              {l2.children!.map((node) => (
                <Item key={node.label} node={node} depth={2} active={l3?.label === node.label} onEnter={() => setL3(node.children?.length ? node : null)} />
              ))}
            </ul>
          )}
        </div>

        {/* Level 3 */}
        <div className={cn("h-full border-l border-gray-200 bg-white transition-all duration-300 overflow-hidden", l3 ? "w-[320px] opacity-100" : "w-0 opacity-0")}>
          {l3 && (
            <ul className="custom-scrollbar flex h-full flex-col overflow-y-auto py-[62px] px-8 animate-fade-in">
              {l3.children!.map((node) => (
                <Item key={node.label} node={node} depth={3} />
              ))}
            </ul>
          )}
        </div>

        {/* Promo image panel */}
        {(l2?.image || l3?.image) && (
          <div className="hidden h-full w-[300px] lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={(l3?.image ?? l2?.image)!} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {/* ---------- Mobile ---------- */}
      <div className="flex h-full flex-col sm:hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          {mobileStack.length ? (
            <button onClick={() => setMobileStack((s) => s.slice(0, -1))} className="flex items-center gap-1 text-sm font-bold uppercase"><ChevronLeft size={16} /> {t(mobileStack[mobileStack.length - 1].label)}</button>
          ) : (
            <div className="flex gap-6">
              {tabs.map(([key, tab]) => (
                <button key={key} onClick={() => setMenuTab(key)} className={cn("text-sm font-bold uppercase", menuTab === key ? "text-black underline underline-offset-4" : "text-gray-400")}>{t(tab.label)}</button>
              ))}
            </div>
          )}
          <button aria-label={t("Закрыть")} onClick={close}><X size={20} strokeWidth={1.5} /></button>
        </div>
        <ul className="flex-1 overflow-y-auto px-4 py-2 animate-fade-in" key={mobileStack.length}>
          {(mobileStack.length ? mobileStack[mobileStack.length - 1].children ?? [] : items).map((node) => (
            <li key={node.label} className="border-b border-gray-100">
              {node.children?.length ? (
                <button onClick={() => setMobileStack((s) => [...s, node])} className="flex w-full items-center justify-between py-3.5 text-left text-sm uppercase">
                  <span style={{ color: node.textColor ?? undefined }}>{t(node.label)}{node.badgeText && <MenuBadge text={node.badgeText} color={node.badgeColor ?? "#000"} />}</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <Link href={node.href ?? "#"} onClick={close} className="flex items-center justify-between py-3.5 text-sm uppercase">
                  <span style={{ color: node.textColor ?? undefined }}>{t(node.label)}{node.badgeText && <MenuBadge text={node.badgeText} color={node.badgeColor ?? "#000"} />}</span>
                </Link>
              )}
            </li>
          ))}
          {!mobileStack.length && (
            <li className="mt-6 flex flex-col gap-2.5">
              {service.map((s, i) => {
                const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                return (
                  <Link key={s.label} href={s.href ?? "#"} onClick={close} className="flex items-center gap-2.5 rounded-sm bg-off-white px-5 py-4 text-sm font-medium">
                    <Icon size={20} strokeWidth={1.5} /> {t(s.label)}
                  </Link>
                );
              })}
              <LanguageSwitcher variant="inline" className="mt-6" />
            </li>
          )}
        </ul>
      </div>
    </Drawer>
  );
}

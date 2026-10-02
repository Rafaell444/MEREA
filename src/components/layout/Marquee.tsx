"use client";
import Link from "next/link";
import type { Announcement } from "@/lib/cms/content";

/** 31px top announcement bar with an infinite marquee, like the live site. */
export default function Marquee({ items }: { items: Announcement[] }) {
  if (!items.length) return null;
  // repeat enough times to cover wide screens, then duplicate for the seamless loop
  const base = Array.from({ length: Math.max(4, Math.ceil(12 / items.length)) }).flatMap(() => items);
  const row = [...base, ...base];
  return (
    <div className="relative z-[60] h-[31px] overflow-hidden bg-white text-black border-b border-gray-200 group/marquee">
      <div className="flex h-full w-max items-center animate-marquee group-hover/marquee:[animation-play-state:paused]" style={{ animationDuration: `${Math.max(30, row.length * 2.2)}s` }}>
        {row.map((a, i) => {
          const inner = <span className="whitespace-nowrap text-xsm font-normal tracking-wide px-10">{a.text}</span>;
          return a.href ? (
            <Link key={i} href={a.href} className="hover:underline underline-offset-4" aria-hidden={i >= base.length}>
              {inner}
            </Link>
          ) : (
            <span key={i} aria-hidden={i >= base.length}>{inner}</span>
          );
        })}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Fades/slides children in when they scroll into view (IntersectionObserver). */
export default function Reveal({ children, className, delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setShown(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Comp = Tag as "div";
  return (
    <Comp ref={ref} className={cn("transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]", shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Comp>
  );
}

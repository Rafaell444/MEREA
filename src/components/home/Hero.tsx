"use client";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import type { HeroSlide } from "@/lib/cms/content";
import { cn } from "@/lib/utils";

/** Full-bleed hero slider that sits under the transparent header (pulled up by the header height). */
export default function Hero({ slides }: { slides: HeroSlide[] }) {
  if (!slides.length) return null;
  return (
    <section className="relative sm:-mt-[56px]">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        speed={900}
        className="hero-swiper h-[calc(100svh-87px)] min-h-[520px] max-h-[900px] w-full sm:h-[calc(100vh-31px)]"
      >
        {slides.map((s, i) => {
          const light = s.textTheme !== "dark";
          const hasImage = Boolean(s.image);
          return (
            <SwiperSlide key={s.id ?? i}>
              <div className={cn("relative h-full w-full overflow-hidden", !hasImage && "bg-[radial-gradient(120%_120%_at_30%_20%,#e5243f_0%,#b3122a_45%,#7a0c1f_100%)]")}>
                {hasImage && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt="" className="hidden h-full w-full object-cover sm:block scale-100 transition-transform duration-[8000ms] ease-linear [.swiper-slide-active_&]:scale-105" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.imageMobile || s.image} alt="" className="h-full w-full object-cover sm:hidden" />
                  </>
                )}
                {!hasImage && (
                  <div className="absolute inset-0 flex items-center justify-center text-white select-none">
                    <div className="flex items-end gap-3 leading-none">
                      <span className="text-[44px] sm:text-[72px] font-light">Распродажа<br />до</span>
                      <span className="text-[96px] sm:text-[180px] font-bold tracking-tight">-70%</span>
                    </div>
                  </div>
                )}
                {s.video && (
                  <video src={s.video} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className={cn("absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent", light ? "from-black/50" : "from-white/40")} style={{ height: "55%" }} />
                <div className={cn("absolute bottom-10 left-4 right-4 max-w-[520px] sm:bottom-14 sm:left-10", s.align === "center" && "sm:left-1/2 sm:-translate-x-1/2 sm:text-center", light ? "text-white" : "text-black")}>
                  <h2 className="text-[28px] font-bold leading-[1.1] sm:text-[40px] [.swiper-slide-active_&]:animate-fade-up">{s.title}</h2>
                  {s.subtitle && <p className="mt-3 max-w-[460px] text-xsm leading-5 sm:text-sm [.swiper-slide-active_&]:animate-fade-up [animation-delay:120ms]">{s.subtitle}</p>}
                  {s.ctaText && s.ctaHref && (
                    <Link href={s.ctaHref} className={cn("mt-5 inline-flex [.swiper-slide-active_&]:animate-fade-up [animation-delay:240ms]", light ? "btn-white h-11 px-7 text-xsm" : "btn-primary h-11 px-7 text-xsm")}>
                      {s.ctaText}
                    </Link>
                  )}
                  {s.note && <p className="mt-5 text-[10px] opacity-80">{s.note}</p>}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

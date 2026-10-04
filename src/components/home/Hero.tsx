"use client";
import Link from "@/components/ui/Link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import type { HeroSlide } from "@/lib/cms/content";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

/** Full-bleed hero slider that sits under the transparent header (pulled up by the header height). */
export default function Hero({ slides }: { slides: HeroSlide[] }) {
  const t = useT();
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
        className="hero-swiper h-[calc(100svh-87px)] min-h-[440px] max-h-[900px] w-full sm:h-[calc(100vh-31px)] sm:min-h-[520px]"
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
                  /* Text-only promo slide: fluid type (clamp + vw) so the lettering always fits the viewport width */
                  <div className="absolute inset-x-0 top-[10%] flex items-center justify-center px-4 text-white select-none sm:inset-y-0 sm:top-0 sm:pb-[14%]">
                    <div className="flex max-w-full flex-wrap items-end justify-center gap-x-[2.5vw] gap-y-[clamp(14px,3vw,28px)] text-center leading-none">
                      <span className="whitespace-nowrap text-[clamp(24px,7vw,72px)] font-light leading-[1.25]">{t("Распродажа до")}</span>
                      <span className="text-[clamp(72px,24vw,180px)] font-bold tracking-tight">-70%</span>
                    </div>
                  </div>
                )}
                {s.video && (
                  <video src={s.video} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className={cn("absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent", light ? "from-black/50" : "from-white/40")} style={{ height: "55%" }} />
                <div className={cn("absolute bottom-10 left-4 right-4 max-w-[520px] sm:bottom-14 sm:left-10", s.align === "center" && "sm:left-1/2 sm:-translate-x-1/2 sm:text-center", light ? "text-white" : "text-black")}>
                  <h2 className="text-[clamp(22px,6.4vw,40px)] font-bold leading-[1.1] [.swiper-slide-active_&]:animate-fade-up">{t(s.title)}</h2>
                  {s.subtitle && <p className="mt-3 max-w-[460px] text-xsm leading-5 sm:text-sm [.swiper-slide-active_&]:animate-fade-up [animation-delay:120ms]">{t(s.subtitle)}</p>}
                  {s.ctaText && s.ctaHref && (
                    <Link href={s.ctaHref} className={cn("mt-5 inline-flex [.swiper-slide-active_&]:animate-fade-up [animation-delay:240ms]", light ? "btn-white h-11 px-7 text-xsm" : "btn-primary h-11 px-7 text-xsm")}>
                      {t(s.ctaText)}
                    </Link>
                  )}
                  {s.note && <p className="mt-5 text-[10px] opacity-80">{t(s.note)}</p>}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

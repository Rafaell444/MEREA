"use client";
import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import type { ProductImage } from "@/lib/catalog/types";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

/** PDP gallery: 2-column grid on desktop (3rd image full-width, like the live site), swiper on mobile, lightbox on click. */
export default function Gallery({ images, title, badges }: { images: ProductImage[]; title: string; badges?: React.ReactNode }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!images.length) return <div className="aspect-[2/3] w-full rounded-lg bg-off-white" />;

  return (
    <>
      <div className="hidden grid-cols-2 gap-1 sm:grid">
        {images.map((img, i) => (
          <button
            key={img.url + i}
            onClick={() => setLightbox(i)}
            className={cn("group relative aspect-[2/3] w-full cursor-zoom-in overflow-hidden rounded-lg bg-off-white", i === 2 && images.length > 3 && "col-span-2 aspect-[4/3]")}
            aria-label={`Фото ${i + 1}`}
          >
            <Image src={img.url} alt={img.alt ?? `${title} ${i + 1}`} fill sizes="(max-width: 1024px) 50vw, 35vw" priority={i < 2} className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
          </button>
        ))}
      </div>

      <div className="relative sm:hidden">
        <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="tile-swiper w-full">
          {images.map((img, i) => (
            <SwiperSlide key={img.url + i}>
              <button onClick={() => setLightbox(i)} className="relative block aspect-[2/3] w-full cursor-zoom-in bg-off-white">
                <Image src={img.url} alt={img.alt ?? title} fill sizes="100vw" priority={i === 0} className="object-cover" />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        {badges && <div className="absolute left-4 top-4 z-10 flex flex-col gap-1">{badges}</div>}
      </div>

      <Modal open={lightbox !== null} onClose={() => setLightbox(null)} size="lg" className="max-w-[92vw] bg-black/0 shadow-none" blur>
        {lightbox !== null && (
          <div className="relative flex items-center justify-center">
            <button onClick={() => setLightbox((i) => (i! - 1 + images.length) % images.length)} aria-label="Предыдущее" className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90"><ChevronLeft size={18} /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[lightbox].url} alt={images[lightbox].alt ?? title} className="max-h-[88vh] w-auto rounded-sm object-contain" />
            <button onClick={() => setLightbox((i) => (i! + 1) % images.length)} aria-label="Следующее" className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90"><ChevronRight size={18} /></button>
            <button onClick={() => setLightbox(null)} aria-label="Закрыть" className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90"><X size={18} /></button>
          </div>
        )}
      </Modal>
    </>
  );
}

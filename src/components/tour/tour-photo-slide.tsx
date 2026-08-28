"use client"

import Image from "next/image"
import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper/types"
import type { TourDetail } from "@/lib/site-data"

import "swiper/css"
import "swiper/css/pagination"

// Первый слайд колоды тура — фото-карусель во всю ширину (без скруглений,
// не в колонке max-w-3xl, как раньше была TourPhotoGallery), но НЕ во всю
// высоту слайда (не фон): зона фото ограничена сверху, снизу — заголовок и
// описание, тот же приём высотного бюджета, что у PhotoSlide на главной
// (advantages-section.tsx) — min(%, Nsvh), чтобы текст не уезжал за экран
// на низких широких окнах.
export function TourPhotoSlide({ tour }: { tour: TourDetail }) {
  const [active, setActive] = useState(0)
  const photos = tour.galleryUrls.length > 0 ? tour.galleryUrls : tour.heroImageUrl ? [tour.heroImageUrl] : []

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {photos.length > 0 ? (
        // Виктор: "фотки на первом слайде огромные, почти на весь экран,
        // внизу описание такое же как сейчас, чтобы не было свободного
        // места" — бюджет фото сильно увеличен (было 52%/42svh/38svh); тут,
        // в отличие от PhotoSlide на главной (advantages-section.tsx), нет
        // TourCtaButton под текстом, поджимать место под кнопку не нужно.
        <div className="relative h-[64%] shrink-0 sm:h-[min(60%,50svh)] lg:h-[min(56%,46svh)]">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".tour-photo-slide-pagination" }}
            onSlideChange={(swiper: SwiperType) => setActive(swiper.activeIndex)}
            className="h-full w-full"
          >
            {photos.map((url, i) => (
              <SwiperSlide key={url} className="relative h-full w-full">
                <Image
                  src={url}
                  alt={`${tour.title}, фото ${i + 1}`}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {photos.length > 1 && (
            <div className="pointer-events-none absolute right-4 bottom-4 z-10 flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 backdrop-blur-md sm:right-6 sm:bottom-6">
              <div className="tour-photo-slide-pagination pointer-events-auto flex items-center gap-1.5" />
              <span className="font-mono text-xs tabular-nums text-white/90">
                {active + 1}/{photos.length}
              </span>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col items-center justify-[safe_center] overflow-y-auto px-4 pt-4 pb-5 text-center sm:px-11 sm:pt-7">
        <span className="text-xs font-medium tracking-widest text-primary uppercase">{tour.durationLabel}</span>
        <h1 className="mt-2 max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {tour.title}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-snug text-muted-foreground sm:mt-3 sm:text-xl">
          {tour.shortDescription}
        </p>
      </div>
    </div>
  )
}

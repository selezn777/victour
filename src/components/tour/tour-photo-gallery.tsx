"use client"

import Image from "next/image"
import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper/types"
import type { TourDetail } from "@/lib/site-data"

import "swiper/css"
import "swiper/css/pagination"

// Раньше это была фото-карусель наверху страницы (полноэкранный "герой") —
// Виктор попросил перенести её сюда, после "Что входит"/"Не входит", перед
// ценой/датой. Внутри общей max-w-3xl колонки, поэтому теперь со скруглением
// и фиксированной (не во весь экран) высотой, а не edge-to-edge как раньше.
export function TourPhotoGallery({ tour }: { tour: TourDetail }) {
  const [active, setActive] = useState(0)
  const photos = tour.galleryUrls.length > 0 ? tour.galleryUrls : tour.heroImageUrl ? [tour.heroImageUrl] : []

  if (photos.length === 0) return null

  return (
    <section className="relative overflow-hidden rounded-2xl">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true, el: ".tour-hero-pagination" }}
        onSlideChange={(swiper: SwiperType) => setActive(swiper.activeIndex)}
        className="h-[50svh] min-h-[320px] w-full sm:h-[60svh]"
      >
        {photos.map((url, i) => (
          <SwiperSlide key={url} className="relative h-full w-full">
            <Image
              src={url}
              alt={`${tour.title}, фото ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(min-width: 768px) 700px, 100vw"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {photos.length > 1 && (
        <div className="pointer-events-none absolute right-4 bottom-4 z-10 flex items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 backdrop-blur-md sm:right-6 sm:bottom-6">
          <div className="tour-hero-pagination pointer-events-auto flex items-center gap-1.5" />
          <span className="font-mono text-xs tabular-nums text-white/90">
            {active + 1}/{photos.length}
          </span>
        </div>
      )}
    </section>
  )
}

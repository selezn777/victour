"use client"

import Image from "next/image"
import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper/types"

import "swiper/css"
import "swiper/css/pagination"

export function TourGallery({ urls, title }: { urls: string[]; title: string }) {
  const [active, setActive] = useState(0)

  if (urls.length === 0) return null

  return (
    <div className="relative -mx-4 sm:mx-0">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true, el: ".tour-gallery-pagination" }}
        onSlideChange={(swiper: SwiperType) => setActive(swiper.activeIndex)}
        spaceBetween={12}
        slidesPerView={1.15}
        centeredSlides={urls.length > 1}
        className="px-4 sm:px-0"
      >
        {urls.map((url, i) => (
          <SwiperSlide key={url} className="aspect-square overflow-hidden rounded-2xl bg-muted">
            <Image
              src={url}
              alt={`${title}, фото ${i + 1}`}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 600px, 90vw"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {urls.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="tour-gallery-pagination flex items-center gap-2" />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {active + 1}/{urls.length}
          </span>
        </div>
      )}
    </div>
  )
}

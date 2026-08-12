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
    <div>
      <h2 className="font-heading text-xl font-semibold sm:text-2xl">Маршрут в фото</h2>
      <div className="relative mt-4">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true, el: ".tour-gallery-pagination" }}
          onSlideChange={(swiper: SwiperType) => setActive(swiper.activeIndex)}
        >
          {urls.map((url, i) => (
            <SwiperSlide key={url}>
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted">
                <Image
                  src={url}
                  alt={`${title}, фото ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 672px) 672px, 100vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent sm:h-16" />
              </div>
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
    </div>
  )
}

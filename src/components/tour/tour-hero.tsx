"use client"

import Image from "next/image"
import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper/types"
import type { TourDetail } from "@/lib/site-data"

import "swiper/css"
import "swiper/css/pagination"

export function TourHero({ tour }: { tour: TourDetail }) {
  const [active, setActive] = useState(0)
  const photos = tour.galleryUrls.length > 0 ? tour.galleryUrls : tour.heroImageUrl ? [tour.heroImageUrl] : []

  return (
    <section>
      {photos.length > 0 && (
        <div className="relative">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".tour-hero-pagination" }}
            onSlideChange={(swiper: SwiperType) => setActive(swiper.activeIndex)}
            className="h-[68svh] min-h-[380px] w-full sm:h-[78svh]"
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
              <div className="tour-hero-pagination pointer-events-auto flex items-center gap-1.5" />
              <span className="font-mono text-xs tabular-nums text-white/90">
                {active + 1}/{photos.length}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 pt-6 pb-2 text-center sm:px-6 sm:pt-8">
        <span className="text-xs font-medium tracking-widest text-primary uppercase">{tour.durationLabel}</span>
        <h1 className="mt-2 font-heading text-3xl leading-tight font-semibold sm:text-5xl">
          {tour.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {tour.shortDescription}
        </p>
      </div>
    </section>
  )
}

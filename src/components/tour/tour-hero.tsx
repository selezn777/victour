"use client"

import Image from "next/image"
import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper/types"
import { Button } from "@/components/ui/button"
import type { TourDetail } from "@/lib/site-data"

import "swiper/css"
import "swiper/css/pagination"

export function TourHero({ tour, onBookClick }: { tour: TourDetail; onBookClick: () => void }) {
  const [active, setActive] = useState(0)
  const photos = tour.galleryUrls.length > 0 ? tour.galleryUrls : tour.heroImageUrl ? [tour.heroImageUrl] : []

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {photos.length > 0 && (
        <div className="relative h-[38%] shrink-0 overflow-hidden sm:h-[42%]">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".tour-hero-pagination" }}
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
              <div className="tour-hero-pagination pointer-events-auto flex items-center gap-1.5" />
              <span className="font-mono text-xs tabular-nums text-white/90">
                {active + 1}/{photos.length}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col items-center overflow-y-auto pl-7 pr-5 pt-5 pb-6 text-center sm:pl-12 sm:pr-10 sm:pt-7">
        <span className="text-xs font-medium tracking-widest text-primary uppercase">{tour.durationLabel}</span>
        <h1 className="mt-2 max-w-xl font-heading text-2xl leading-tight font-semibold sm:text-4xl">
          {tour.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {tour.shortDescription}
        </p>
        <Button type="button" size="lg" className="mt-6 w-full max-w-md" onClick={onBookClick}>
          Забронировать
        </Button>
      </div>
    </div>
  )
}

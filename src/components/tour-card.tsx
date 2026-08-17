"use client"

import Image from "next/image"
import Link from "next/link"
import { HeartIcon } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatUsd } from "@/lib/format"
import type { CatalogTour } from "@/lib/site-data"

import "swiper/css"
import "swiper/css/pagination"

export function TourCard({
  tour,
  isFavorite,
  onToggleFavorite,
  fill,
}: {
  tour: CatalogTour
  isFavorite: boolean
  onToggleFavorite: () => void
  /** Заполнить родителя целиком вместо фиксированного aspect-3/4 — для
   * использования внутри слайда с уже заданной высотой (см. TourCatalog). */
  fill?: boolean
}) {
  const photos = tour.galleryUrls.length > 0 ? tour.galleryUrls : tour.heroImageUrl ? [tour.heroImageUrl] : []
  const paginationClass = `tour-card-pagination-${tour.slug}`

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-muted",
        fill ? "h-full w-full" : "aspect-3/4",
      )}
    >
      <Link href={`/tours/${tour.slug}`} className="absolute inset-0">
        {photos.length > 0 && (
          <Swiper
            modules={[Pagination]}
            pagination={photos.length > 1 ? { clickable: false, el: `.${paginationClass}` } : false}
            className="absolute inset-0 h-full w-full"
          >
            {photos.map((url, i) => (
              <SwiperSlide key={url} className="relative h-full w-full">
                <Image
                  src={url}
                  alt={tour.title}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

        {photos.length > 1 && (
          // top-right, под кнопкой избранного (не top-left — там, когда карточка
          // используется в SlideDeck, сидит книжный "переплёт"-индикатор колоды).
          <div className="pointer-events-none absolute top-14 right-3 z-10 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-md">
            <div className={`flex items-center gap-1.5 ${paginationClass}`} />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 px-5 pt-5 pb-6 text-white">
          <span className="text-xs tracking-wide text-white/70 uppercase">
            {tour.durationLabel}
          </span>
          <h3 className="font-heading text-2xl leading-tight font-semibold">{tour.title}</h3>
          <p className="line-clamp-2 text-sm text-white/80">{tour.shortDescription}</p>

          <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="text-base font-medium text-primary">
              от {formatUsd(tour.priceFromUsd)} / чел
            </span>
            <span className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium transition-colors group-hover:border-white/70">
              Программа тура
            </span>
          </div>
        </div>
      </Link>

      <Button
        variant="secondary"
        size="icon-sm"
        aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={isFavorite}
        onClick={onToggleFavorite}
        className="absolute top-3 right-3 z-10 bg-background/70 backdrop-blur-sm hover:bg-background"
      >
        <HeartIcon className={cn(isFavorite && "fill-current text-destructive")} />
      </Button>
    </article>
  )
}

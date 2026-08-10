"use client"

import Image from "next/image"
import Link from "next/link"
import { HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatUsd } from "@/lib/format"
import type { CatalogTour } from "@/lib/site-data"

export function TourCard({
  tour,
  isFavorite,
  onToggleFavorite,
}: {
  tour: CatalogTour
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  return (
    <article className="group relative aspect-3/4 overflow-hidden rounded-2xl bg-muted">
      <Link href={`/tours/${tour.slug}`} className="absolute inset-0">
        {tour.heroImageUrl && (
          <Image
            src={tour.heroImageUrl}
            alt={tour.title}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-white">
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

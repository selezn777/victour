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
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {tour.heroImageUrl && (
          <Image
            src={tour.heroImageUrl}
            alt={tour.title}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <HeartIcon className={cn(isFavorite && "fill-current text-destructive")} />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-heading text-base font-semibold">{tour.title}</h3>
        <p className="text-sm text-muted-foreground">{tour.shortDescription}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{tour.durationLabel}</span>
            <span className="text-sm font-medium">от {formatUsd(tour.priceFromUsd)} / чел</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/tours/${tour.slug}`} />}
          >
            Программа тура
          </Button>
        </div>
      </div>
    </article>
  )
}

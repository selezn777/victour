import Image from "next/image"
import type { TourDetail } from "@/lib/site-data"

export function TourHero({ tour }: { tour: TourDetail }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-8">
      {tour.heroImageUrl && (
        <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-3xl bg-muted">
          <Image
            src={tour.heroImageUrl}
            alt={tour.title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 672px) 672px, 100vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent sm:h-16" />
        </div>
      )}

      <div className="pt-6 pb-2 text-center sm:pt-8">
        <span className="text-xs font-medium tracking-widest text-primary uppercase">{tour.durationLabel}</span>
        <h1 className="mt-2 font-heading text-3xl leading-tight font-semibold italic sm:text-5xl">
          {tour.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {tour.shortDescription}
        </p>
      </div>
    </section>
  )
}

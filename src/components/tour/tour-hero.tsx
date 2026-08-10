import Image from "next/image"
import type { TourDetail } from "@/lib/site-data"

export function TourHero({ tour }: { tour: TourDetail }) {
  return (
    <section className="relative flex h-[70svh] min-h-[420px] flex-col justify-end overflow-hidden">
      {tour.heroImageUrl && (
        <Image
          src={tour.heroImageUrl}
          alt={tour.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 text-white sm:px-6 sm:pb-12">
        <span className="text-xs tracking-wide text-white/70 uppercase">{tour.durationLabel}</span>
        <h1 className="mt-2 font-heading text-3xl leading-tight font-semibold italic sm:text-5xl">
          {tour.title}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">{tour.shortDescription}</p>
      </div>
    </section>
  )
}

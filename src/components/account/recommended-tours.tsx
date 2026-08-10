"use client"

import { TourCard } from "@/components/tour-card"
import { useFavorites } from "@/hooks/use-favorites"
import type { CatalogTour } from "@/lib/site-data"

export function RecommendedTours({ tours }: { tours: CatalogTour[] }) {
  const { toggle, isFavorite } = useFavorites()

  if (tours.length === 0) return null

  return (
    <section>
      <h2 className="font-heading text-lg font-semibold sm:text-xl">Рекомендуем</h2>
      <p className="mt-1 text-sm text-muted-foreground">Туры, которые вы ещё не бронировали.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <TourCard
            key={tour.slug}
            tour={tour}
            isFavorite={isFavorite(tour.slug)}
            onToggleFavorite={() => toggle(tour.slug)}
          />
        ))}
      </div>
    </section>
  )
}

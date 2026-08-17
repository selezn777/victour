import { TourCard } from "@/components/tour-card"
import { SlideDeck } from "@/components/slide-deck"
import type { CatalogTour } from "@/lib/site-data"

export function TourCatalog({
  tours,
  isFavorite,
  onToggleFavorite,
}: {
  tours: CatalogTour[]
  isFavorite: (slug: string) => boolean
  onToggleFavorite: (slug: string) => void
}) {
  if (tours.length === 0) return null

  return (
    // Ни заголовка, ни поиска/избранного, ни боковых отступов, ни
    // ограничения ширины — Виктор явно сказал "это не во весь экран":
    // карточка должна быть впритык под хедером и во всю ширину экрана,
    // без полей по бокам. Высота — точная формула (100svh минус хедер
    // SiteHeader h-16/sm:h-20).
    <section id="catalog">
      <SlideDeck
        className="h-[calc(100svh-4rem)] w-full sm:h-[calc(100svh-5rem)]"
        slides={tours.map((tour) => (
          <TourCard
            key={tour.slug}
            tour={tour}
            fill
            isFavorite={isFavorite(tour.slug)}
            onToggleFavorite={() => onToggleFavorite(tour.slug)}
          />
        ))}
      />
    </section>
  )
}

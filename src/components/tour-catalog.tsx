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
    <section id="catalog" className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Ни заголовка "Наши туры", ни строки поиска/избранного — Виктор
          попросил убрать всё, что отъедает место от карточки: она сразу
          под хедером, почти во весь экран ("как в каталоге в журнале").
          Высота деки — точная формула (100svh минус хедер SiteHeader
          h-16/sm:h-20), без промежуточных элементов над ней. */}
      <div className="mx-auto w-full max-w-sm sm:max-w-md">
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
      </div>
    </section>
  )
}

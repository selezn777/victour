import { TourCard } from "@/components/tour-card"
import type { CatalogTour } from "@/lib/site-data"

export function TourCatalog({
  tours,
  isFavorite,
  onToggleFavorite,
  emptyMessage,
}: {
  tours: CatalogTour[]
  isFavorite: (slug: string) => boolean
  onToggleFavorite: (slug: string) => void
  emptyMessage: string
}) {
  return (
    <section id="catalog" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h2 className="font-heading text-xl font-semibold sm:text-2xl">Наши туры</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Пять авторских программ. Дата и гид — на странице каждого тура.
      </p>

      {tours.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard
              key={tour.slug}
              tour={tour}
              isFavorite={isFavorite(tour.slug)}
              onToggleFavorite={() => onToggleFavorite(tour.slug)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

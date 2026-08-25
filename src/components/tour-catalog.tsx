import { TourCard } from "@/components/tour-card"
import { SlideDeck } from "@/components/slide-deck"
import type { CatalogTour } from "@/lib/site-data"

export function TourCatalog({ tours }: { tours: CatalogTour[] }) {
  if (tours.length === 0) return null

  return (
    // Ни заголовка, ни поиска/избранного, ни боковых отступов, ни
    // ограничения ширины — Виктор явно сказал "это не во весь экран":
    // карточка должна быть впритык под хедером и во всю ширину экрана,
    // без полей по бокам. Высота — точная формула (100dvh минус хедер
    // SiteHeader h-16/sm:h-20) — dvh, не svh, см. комментарий в
    // slide-deck.tsx про прижатый к верху контент на реальных телефонах.
    // Переключение между турами — вбок (не вниз, как на главной):
    // переплёт снизу горизонтальным рядом точек, а не сверху слева
    // книжным столбиком.
    <section id="catalog">
      <SlideDeck
        className="h-[calc(100dvh-4rem)] w-full sm:h-[calc(100dvh-5rem)]"
        direction="horizontal"
        paginationPosition="bottom-center"
        slides={tours.map((tour) => (
          <TourCard key={tour.slug} tour={tour} fill />
        ))}
      />
    </section>
  )
}

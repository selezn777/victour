"use client"

import { useMemo, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { TourCatalog } from "@/components/tour-catalog"
import { useFavorites } from "@/hooks/use-favorites"
import type { CatalogTour, PrimaryGuide, SiteSettings } from "@/lib/site-data"

export function ToursPageClient({
  tours,
  settings,
  guide,
  initialQuery,
  initialFavoritesOnly,
}: {
  tours: CatalogTour[]
  settings: SiteSettings
  guide: PrimaryGuide | null
  initialQuery: string
  initialFavoritesOnly: boolean
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavoritesOnly)
  const { favorites, toggle, isFavorite } = useFavorites()

  const visibleTours = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return tours.filter((tour) => {
      const matchesQuery =
        query.length === 0 ||
        tour.title.toLowerCase().includes(query) ||
        tour.shortDescription.toLowerCase().includes(query)
      const matchesFavorites = !favoritesOnly || isFavorite(tour.slug)
      return matchesQuery && matchesFavorites
    })
  }, [tours, searchQuery, favoritesOnly, isFavorite])

  return (
    <>
      <SiteHeader
        settings={settings}
        guide={guide}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesOnly={favoritesOnly}
        onToggleFavoritesOnly={() => setFavoritesOnly((v) => !v)}
        favoritesCount={favorites.length}
      />
      <main className="flex-1">
        <TourCatalog
          tours={visibleTours}
          isFavorite={isFavorite}
          onToggleFavorite={toggle}
          emptyMessage={
            favoritesOnly
              ? "Пока нет избранных туров — нажмите на сердечко на карточке."
              : "Ничего не найдено. Попробуйте другой запрос."
          }
        />
      </main>
    </>
  )
}

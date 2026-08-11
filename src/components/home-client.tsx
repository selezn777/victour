"use client"

import { useMemo, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { AdvantagesSection } from "@/components/advantages-section"
import { DiscountsSection } from "@/components/discounts-section"
import { TourCatalog } from "@/components/tour-catalog"
import { FeaturedReviews } from "@/components/featured-reviews"
import { useFavorites } from "@/hooks/use-favorites"
import type { CatalogTour, PrimaryGuide, SiteSettings } from "@/lib/site-data"
import type { Review } from "@/lib/reviews-data"

export function HomeClient({
  tours,
  settings,
  guide,
  guideReviews,
}: {
  tours: CatalogTour[]
  settings: SiteSettings
  guide: PrimaryGuide | null
  guideReviews: Review[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [favoritesOnly, setFavoritesOnly] = useState(false)
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
        <HeroSection />
        <AdvantagesSection />
        <DiscountsSection packageDiscounts={settings.packageDiscounts} />
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

        <FeaturedReviews reviews={guideReviews} guideName={guide?.name ?? null} />
      </main>
    </>
  )
}

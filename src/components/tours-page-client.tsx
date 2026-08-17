"use client"

import { SiteHeader } from "@/components/site-header"
import { TourCatalog } from "@/components/tour-catalog"
import { useFavorites } from "@/hooks/use-favorites"
import type { CatalogTour, PrimaryGuide, SiteSettings } from "@/lib/site-data"

export function ToursPageClient({
  tours,
  settings,
  guide,
}: {
  tours: CatalogTour[]
  settings: SiteSettings
  guide: PrimaryGuide | null
}) {
  const { toggle, isFavorite } = useFavorites()

  return (
    <>
      <SiteHeader settings={settings} guide={guide} />
      <main className="flex-1">
        <TourCatalog tours={tours} isFavorite={isFavorite} onToggleFavorite={toggle} />
      </main>
    </>
  )
}

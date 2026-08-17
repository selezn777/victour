"use client"

import { SiteHeader } from "@/components/site-header"
import { TourCatalog } from "@/components/tour-catalog"
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
  return (
    <>
      <SiteHeader settings={settings} guide={guide} />
      <main className="flex-1">
        <TourCatalog tours={tours} />
      </main>
    </>
  )
}

"use client"

import { SiteHeader } from "@/components/site-header"
import { AdvantagesSection } from "@/components/advantages-section"
import type { PrimaryGuide, SiteSettings } from "@/lib/site-data"
import type { Review } from "@/lib/reviews-data"

export function HomeClient({
  settings,
  guide,
  heroQuotes,
}: {
  settings: SiteSettings
  guide: PrimaryGuide | null
  heroQuotes: Review[]
}) {
  return (
    <>
      <SiteHeader settings={settings} guide={guide} />
      <main className="flex-1">
        <AdvantagesSection heroQuotes={heroQuotes} />
      </main>
    </>
  )
}

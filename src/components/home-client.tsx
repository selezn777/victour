"use client"

import { SiteHeader } from "@/components/site-header"
import { AdvantagesSection } from "@/components/advantages-section"
import { DiscountsSection } from "@/components/discounts-section"
import { FeaturedReviews } from "@/components/featured-reviews"
import type { PrimaryGuide, SiteSettings } from "@/lib/site-data"
import type { Review } from "@/lib/reviews-data"

export function HomeClient({
  settings,
  guide,
  guideReviews,
  heroQuotes,
}: {
  settings: SiteSettings
  guide: PrimaryGuide | null
  guideReviews: Review[]
  heroQuotes: Review[]
}) {
  return (
    <>
      <SiteHeader settings={settings} guide={guide} />
      <main className="flex-1">
        <AdvantagesSection heroQuotes={heroQuotes} packageDiscounts={settings.packageDiscounts} />
        <DiscountsSection packageDiscounts={settings.packageDiscounts} />
        <FeaturedReviews reviews={guideReviews} guideName={guide?.name ?? null} />
      </main>
    </>
  )
}

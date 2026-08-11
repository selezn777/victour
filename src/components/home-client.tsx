"use client"

import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { AdvantagesSection } from "@/components/advantages-section"
import { DiscountsSection } from "@/components/discounts-section"
import { CuratedSection } from "@/components/curated-section"
import { FeaturedReviews } from "@/components/featured-reviews"
import type { PrimaryGuide, SiteSettings } from "@/lib/site-data"
import type { Review } from "@/lib/reviews-data"

export function HomeClient({
  settings,
  guide,
  guideReviews,
}: {
  settings: SiteSettings
  guide: PrimaryGuide | null
  guideReviews: Review[]
}) {
  const router = useRouter()

  return (
    <>
      <SiteHeader
        settings={settings}
        guide={guide}
        searchQuery=""
        onSearchChange={(query) => router.push(query ? `/tours?q=${encodeURIComponent(query)}` : "/tours")}
        favoritesOnly={false}
        onToggleFavoritesOnly={() => router.push("/tours?favorites=1")}
        favoritesCount={0}
      />
      <main className="flex-1">
        <HeroSection />
        <AdvantagesSection />
        <DiscountsSection packageDiscounts={settings.packageDiscounts} />
        <CuratedSection />
        <FeaturedReviews reviews={guideReviews} guideName={guide?.name ?? null} />
      </main>
    </>
  )
}

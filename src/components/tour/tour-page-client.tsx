"use client"

import { useState } from "react"
import { TourHeader } from "@/components/tour/tour-header"
import { TourHero } from "@/components/tour/tour-hero"
import { TourItinerary } from "@/components/tour/tour-itinerary"
import { TourIncludesExcludes } from "@/components/tour/tour-includes-excludes"
import { TourPriceTable } from "@/components/tour/tour-price-table"
import { TourTicketOptions } from "@/components/tour/tour-ticket-options"
import { TourBookingPanel } from "@/components/tour/tour-booking-panel"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { FaqSection } from "@/components/faq/faq-section"
import { useFavorites } from "@/hooks/use-favorites"
import type { SiteSettings, TourDetail, TourGuide } from "@/lib/site-data"
import type { Review, TourOption } from "@/lib/reviews-data"
import type { FaqItem } from "@/lib/faq-data"

export function TourPageClient({
  tour,
  guides,
  settings,
  reviews,
  faq,
  tours,
}: {
  tour: TourDetail
  guides: TourGuide[]
  settings: SiteSettings
  reviews: Review[]
  faq: FaqItem[]
  tours: TourOption[]
}) {
  const { toggle, isFavorite } = useFavorites()
  const [guestCount, setGuestCount] = useState(2)
  const primaryGuide = guides[0] ?? null

  return (
    <>
      <TourHeader
        settings={settings}
        guide={primaryGuide}
        isFavorite={isFavorite(tour.slug)}
        onToggleFavorite={() => toggle(tour.slug)}
      />
      <main className="flex-1">
        <TourHero tour={tour} />

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12">
            <div className="flex flex-col gap-10">
              <TourIncludesExcludes includes={tour.includes} excludes={tour.excludes} />
              <TourItinerary itinerary={tour.itinerary} isTwoDay={tour.isDalatTwoDay} />
              <TourPriceTable tiers={tour.pricingTiers} settings={settings} selectedGuestCount={guestCount} />
              {tour.ticketOptions.length > 0 && <TourTicketOptions options={tour.ticketOptions} />}

              <ReviewsSection
                title="Отзывы об этом туре"
                reviews={reviews}
                tours={[]}
                guideId={primaryGuide?.id ?? null}
                guideName={primaryGuide?.name ?? null}
                lockedTourId={tour.id}
                hideTarget="tour"
                emptyMessage="Пока нет отзывов об этом туре — станьте первым."
              />

              <FaqSection
                title="Вопросы и ответы"
                items={faq}
                tours={tours}
                lockedTourId={tour.id}
                emptyMessage="Вопросов пока нет — задайте свой."
              />
            </div>

            <div className="lg:sticky lg:top-20">
              <TourBookingPanel
                tour={tour}
                guides={guides}
                settings={settings}
                selectedGuestCount={guestCount}
                onGuestCountChange={setGuestCount}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

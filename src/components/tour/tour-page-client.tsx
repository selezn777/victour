"use client"

import { useState } from "react"
import { TourHeader } from "@/components/tour/tour-header"
import { TourHero } from "@/components/tour/tour-hero"
import { TourPhotoGallery } from "@/components/tour/tour-photo-gallery"
import { TourItinerary } from "@/components/tour/tour-itinerary"
import { TourIncludesExcludes } from "@/components/tour/tour-includes-excludes"
import { TourPriceTable } from "@/components/tour/tour-price-table"
import { TourBookingPanel } from "@/components/tour/tour-booking-panel"
import { TourStickyCta } from "@/components/tour/tour-sticky-cta"
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
  // По умолчанию — самая большая группа (обычно самая дешёвая цена за
  // человека, тарифы отсортированы по возрастанию guestCount): гость,
  // который просто листает страницу, должен сначала видеть младшую
  // цену, а не по умолчанию за двоих. Своё реальное число гостей он
  // выставит уже в блоке брони.
  const cheapestTier = tour.pricingTiers[tour.pricingTiers.length - 1]
  const [guestCount, setGuestCount] = useState(cheapestTier?.guestCount ?? 2)
  const primaryGuide = guides[0] ?? null
  const priceAdultUsd =
    tour.pricingTiers.find((t) => t.guestCount === guestCount)?.priceAdultUsd ?? 0

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

        {/* Виктор задал строгий порядок чтения: маршрут → что входит → фото
            → цена (с выбором гостей) → бронь (дата, сразу тут же) → отзывы
            → вопросы. Раньше бронь была отдельной sticky-колонкой справа на
            десктопе — теперь она встроена в общий поток на своём месте,
            одна колонка на всех размерах экрана. Фото-карусель раньше стояла
            наверху страницы — перенесена сюда, после "Что входит". */}
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
          <TourItinerary itinerary={tour.itinerary} isTwoDay={tour.isDalatTwoDay} />
          <TourIncludesExcludes includes={tour.includes} excludes={tour.excludes} />
          <TourPhotoGallery tour={tour} />
          <TourPriceTable
            tiers={tour.pricingTiers}
            selectedGuestCount={guestCount}
            onSelectGuestCount={setGuestCount}
          />
          <div id="tour-booking-panel">
            <TourBookingPanel
              tour={tour}
              guides={guides}
              settings={settings}
              selectedGuestCount={guestCount}
              onGuestCountChange={setGuestCount}
            />
          </div>

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
      </main>
      {/* Бронь теперь не sticky-сайдбар, а обычный блок в потоке — эта
          плашка следит, виден ли он, и на любом размере экрана предлагает
          быстро вернуться к брони (нужнее всего именно у отзывов/вопросов,
          которые идут ниже брони). */}
      <TourStickyCta priceAdultUsd={priceAdultUsd} targetId="tour-booking-panel" />
    </>
  )
}

"use client"

import { useRef, useState, type ReactNode } from "react"
import type { Swiper as SwiperType } from "swiper/types"
import { TourHeader } from "@/components/tour/tour-header"
import { TourHero } from "@/components/tour/tour-hero"
import { TourItinerary } from "@/components/tour/tour-itinerary"
import { TourIncludesExcludes } from "@/components/tour/tour-includes-excludes"
import { TourPriceTable } from "@/components/tour/tour-price-table"
import { TourBookingPanel } from "@/components/tour/tour-booking-panel"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { FaqSection } from "@/components/faq/faq-section"
import { SlideDeck } from "@/components/slide-deck"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import type { SiteSettings, TourDetail, TourGuide } from "@/lib/site-data"
import type { Review, TourOption } from "@/lib/reviews-data"
import type { FaqItem } from "@/lib/faq-data"

// Слайд брони — 5-й по счёту (индекс 4): фото → что входит → цена →
// маршрут по дням → БРОНЬ → отзывы → вопросы. Кнопка "Забронировать" в
// каждом из остальных слайдов переключает деку сюда через Swiper API —
// тот же принцип, что и книжный "переплёт"-индикатор на главной, вместо
// прежнего scrollIntoView (та механика имела смысл только при обычном
// непрерывном скролле страницы, которого теперь нет).
const BOOKING_SLIDE_INDEX = 4

function ContentSlide({ children, onBookClick }: { children: ReactNode; onBookClick: () => void }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-y-auto pl-7 pr-5 pt-6 pb-6 sm:pl-12 sm:pr-10 sm:pt-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
        <Button type="button" size="lg" className="mt-8 w-full max-w-md self-center" onClick={onBookClick}>
          Забронировать
        </Button>
      </div>
    </div>
  )
}

function BookingSlide({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-y-auto pl-7 pr-5 pt-6 pb-6 sm:pl-12 sm:pr-10 sm:pt-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </div>
    </div>
  )
}

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
  const swiperRef = useRef<SwiperType | null>(null)
  const goToBooking = () => swiperRef.current?.slideTo(BOOKING_SLIDE_INDEX)

  return (
    <>
      <TourHeader
        settings={settings}
        guide={primaryGuide}
        isFavorite={isFavorite(tour.slug)}
        onToggleFavorite={() => toggle(tour.slug)}
      />
      <main className="flex-1">
        <SlideDeck
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          slides={[
            <TourHero key="hero" tour={tour} onBookClick={goToBooking} />,
            <ContentSlide key="includes" onBookClick={goToBooking}>
              <TourIncludesExcludes includes={tour.includes} excludes={tour.excludes} />
            </ContentSlide>,
            <ContentSlide key="price" onBookClick={goToBooking}>
              <TourPriceTable
                tiers={tour.pricingTiers}
                selectedGuestCount={guestCount}
                onSelectGuestCount={setGuestCount}
              />
            </ContentSlide>,
            <ContentSlide key="itinerary" onBookClick={goToBooking}>
              <TourItinerary itinerary={tour.itinerary} isTwoDay={tour.isDalatTwoDay} />
            </ContentSlide>,
            <BookingSlide key="booking">
              <TourBookingPanel
                tour={tour}
                guides={guides}
                settings={settings}
                selectedGuestCount={guestCount}
                onGuestCountChange={setGuestCount}
              />
            </BookingSlide>,
            <ContentSlide key="reviews" onBookClick={goToBooking}>
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
            </ContentSlide>,
            <ContentSlide key="faq" onBookClick={goToBooking}>
              <FaqSection
                title="Вопросы и ответы"
                items={faq}
                tours={tours}
                lockedTourId={tour.id}
                emptyMessage="Вопросов пока нет — задайте свой."
              />
            </ContentSlide>,
          ]}
        />
      </main>
    </>
  )
}

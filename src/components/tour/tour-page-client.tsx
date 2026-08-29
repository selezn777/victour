"use client"

import { useRef, useState } from "react"
import type { Swiper as SwiperType } from "swiper/types"
import { SlideDeck } from "@/components/slide-deck"
import { TourHeader } from "@/components/tour/tour-header"
import { TourPhotoSlide } from "@/components/tour/tour-photo-slide"
import { TourItinerarySlide } from "@/components/tour/tour-itinerary-slide"
import { TourIncludesSlide } from "@/components/tour/tour-includes-slide"
import { TourBookingSlide } from "@/components/tour/tour-booking-slide"
import { TourFaqSlide } from "@/components/tour/tour-faq-slide"
import { TourReviewsSlide } from "@/components/tour/tour-reviews-slide"
import { TourBottomBar } from "@/components/tour/tour-bottom-bar"
import { useFavorites } from "@/hooks/use-favorites"
import type { SiteSettings, TourDetail, TourGuide } from "@/lib/site-data"
import type { Review, TourOption } from "@/lib/reviews-data"
import type { FaqItem } from "@/lib/faq-data"

// Слайды по порядку: фото → маршрут (день 1[, день 2]) → что входит →
// бронь → FAQ → отзывы. Отзывы теперь тоже слайд колоды (раньше были
// отдельным блоком под ней — Виктор передумал: "пусть будет не кнопка, а
// прям ещё один слайд").

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
  // выставит уже на слайде брони.
  const cheapestTier = tour.pricingTiers[tour.pricingTiers.length - 1]
  const [guestCount, setGuestCount] = useState(cheapestTier?.guestCount ?? 2)
  const primaryGuide = guides[0] ?? null
  const priceAdultUsd =
    tour.pricingTiers.find((t) => t.guestCount === guestCount)?.priceAdultUsd ?? 0

  const swiperRef = useRef<SwiperType | null>(null)

  // Двухдневные туры (Далат) — маршрут отдельными слайдами по дню, а не
  // колонками side-by-side на одном слайде (Виктор со скриншотом: "в
  // двухдневном Далате не влез маршрут... делаем сначала день один потом
  // день два отдельными слайдами" — half-width колонка обрезала длинные
  // пункты). Индекс слайда брони считаем от фактического числа слайдов
  // маршрута, а не константой — у двухдневных туров он на 1 больше.
  const itinerarySlides = tour.isDalatTwoDay
    ? Array.from(new Set(tour.itinerary.map((i) => i.day)))
        .sort((a, b) => a - b)
        .map((day) => (
          <TourItinerarySlide
            key={`itinerary-${day}`}
            itinerary={tour.itinerary}
            day={day}
            dayLabel={`День ${day}`}
          />
        ))
    : [<TourItinerarySlide key="itinerary" itinerary={tour.itinerary} day={tour.itinerary[0]?.day ?? 1} />]
  const bookingSlideIndex = 1 + itinerarySlides.length + 1

  return (
    <>
      <TourHeader
        settings={settings}
        guide={primaryGuide}
        isFavorite={isFavorite(tour.slug)}
        onToggleFavorite={() => toggle(tour.slug)}
      />

      {/* paginationPosition="none" — тот же "переплёт"-индикатор слева,
          который Виктор уже попросил убрать на главной, здесь тоже мешал. */}
      <SlideDeck
        paginationPosition="none"
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        slides={[
          <TourPhotoSlide key="photo" tour={tour} />,
          ...itinerarySlides,
          <TourIncludesSlide key="includes" includes={tour.includes} excludes={tour.excludes} />,
          <TourBookingSlide
            key="booking"
            tour={tour}
            guides={guides}
            guestCount={guestCount}
            onGuestCountChange={setGuestCount}
          />,
          <TourFaqSlide
            key="faq"
            items={faq}
            tours={tours}
            lockedTourId={tour.id}
            emptyMessage="Вопросов пока нет — задайте свой."
            onRequestPrevSlide={() => swiperRef.current?.slidePrev()}
            onRequestNextSlide={() => swiperRef.current?.slideNext()}
          />,
          <TourReviewsSlide
            key="reviews"
            reviews={reviews}
            tours={[]}
            guideId={primaryGuide?.id ?? null}
            guideName={primaryGuide?.name ?? null}
            lockedTourId={tour.id}
            emptyMessage="Пока нет отзывов об этом туре — станьте первым."
            onRequestPrevSlide={() => swiperRef.current?.slidePrev()}
          />,
        ]}
      />

      <TourBottomBar
        priceAdultUsd={priceAdultUsd}
        ctaLabel="Подробнее"
        onCtaClick={() => swiperRef.current?.slideTo(bookingSlideIndex)}
      />
    </>
  )
}

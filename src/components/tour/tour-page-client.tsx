"use client"

import { useEffect, useRef, useState } from "react"
import { useBottomBarHeightVar } from "@/hooks/use-bottom-bar-height-var"
import { usePackage } from "@/hooks/use-package"
import { isRecentBackNavigation } from "@/lib/navigation"
import type { Swiper as SwiperType } from "swiper/types"
import { SlideDeck } from "@/components/slide-deck"
import { TourHeader } from "@/components/tour/tour-header"
import { TourPhotoSlide } from "@/components/tour/tour-photo-slide"
import { TourItinerarySlide } from "@/components/tour/tour-itinerary-slide"
import { TourIncludesSlide } from "@/components/tour/tour-includes-slide"
import { whatToBringFor } from "@/lib/what-to-bring"
import { TourBookingSlide } from "@/components/tour/tour-booking-slide"
import { TourFaqSlide } from "@/components/tour/tour-faq-slide"
import { TourReviewsSlide } from "@/components/tour/tour-reviews-slide"
import { TourBottomBar } from "@/components/tour/tour-bottom-bar"
import type { SiteSettings, TourDetail, TourGuide } from "@/lib/site-data"
import type { Review, TourOption } from "@/lib/reviews-data"
import type { FaqItem } from "@/lib/faq-data"

// Слайды по порядку: фото → маршрут (день 1[, день 2]) → что входит →
// что взять с собой → бронь → FAQ → отзывы. Отзывы теперь тоже слайд
// колоды (раньше были отдельным блоком под ней — Виктор передумал: "пусть
// будет не кнопка, а прям ещё один слайд").

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

  // Тур уже полностью настроен в заявке (localStorage) — гость перезагрузил
  // страницу или вернулся позже. usePackage() на первом клиентском рендере
  // отдаёт пустой server-snapshot (см. useSyncExternalStore), реальные
  // данные приходят следующим рендером — поэтому гидратация тут через
  // useEffect с once-гвардом, а не через useState-инициализатор (тот
  // выполняется единожды при монтировании и не увидел бы более поздние
  // данные). Виктор: "дата и количество человек должны запоминаться и
  // отображаться даже после перезагрузки, сейчас у них конфликт".
  const { items } = usePackage()
  const existingItem = items.find((i) => i.tourSlug === tour.slug) ?? null
  const hydratedGuestCountRef = useRef(false)
  useEffect(() => {
    if (hydratedGuestCountRef.current || !existingItem?.adults) return
    hydratedGuestCountRef.current = true
    setGuestCount(existingItem.adults)
  }, [existingItem])

  const swiperRef = useRef<SwiperType | null>(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const bottomBarRef = useRef<HTMLDivElement>(null)
  useBottomBarHeightVar(bottomBarRef)

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
  // +1 фото, +1 слайд "Что входит" (раньше тут было +2 — "Что входит" и
  // "Что взять с собой" были двумя отдельными слайдами; после их слияния
  // обратно в один (см. tour-includes-slide.tsx) индекс брони съехал на 1,
  // и плашка с ценой пряталась не на слайде брони, а на следующем за ним
  // (FAQ) — там же из-за этого "обрезалась" страница (деке всё равно
  // вычитала высоту плашки, а сама плашка на FAQ была скрыта).
  const bookingSlideIndex = 1 + itinerarySlides.length + 1

  // Плашка скрыта на фото (там и так "тыкни"/свайп) и на слайде брони
  // (там уже есть своя кнопка "Добавить в заявку" с ценой, дублировать не
  // нужно) — см. TourBottomBar ниже. Это чистый fade кнопки (opacity),
  // высоту деки больше не трогает вообще — см. className деки и
  // use-bottom-bar-height-var.ts.
  const bottomBarHidden = activeSlideIndex === 0 || activeSlideIndex === bookingSlideIndex

  return (
    <>
      <TourHeader settings={settings} guide={primaryGuide} />

      {/* paginationPosition="none" — тот же "переплёт"-индикатор слева,
          который Виктор уже попросил убрать на главной, здесь тоже мешал. */}
      {/* Виктор: "Читать статью об этом месте" уводит на /blog/[slug] —
          отдельный роут, а не слайд этой же деки. По кнопке "назад" со
          статьи страница тура раньше монтировалась заново с нуля (слайд
          "Маршрут" терялся — "надо чтобы назад возвращало к маршруту, а не
          к началу страницы"). Деке негде хранить активный слайд в URL, а
          у Swiper вообще нет server-driven state — запоминаем индекс в
          sessionStorage при каждой смене слайда.
          Но восстанавливаем НЕ всегда — только если реально вернулись
          назад (popstate), а не зашли на тур заново по обычной ссылке,
          например с главной (Виктор: "если я хочу вернуться из подробнее
          и из статей — да, вернуться нужно на маршрут, но если захожу с
          главной заново — должен видеть первый слайд, как будто открыл
          впервые"). isRecentBackNavigation() отличает эти два случая —
          см. src/lib/navigation.ts. */}
      <SlideDeck
        paginationPosition="none"
        className="h-[calc(100dvh-var(--site-header-h))] w-full"
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          const saved = sessionStorage.getItem(`tour-slide:${tour.slug}`)
          if (saved != null && isRecentBackNavigation()) {
            swiper.slideTo(Number(saved), 0)
          }
          sessionStorage.removeItem(`tour-slide:${tour.slug}`)
        }}
        onSlideChange={(index) => {
          sessionStorage.setItem(`tour-slide:${tour.slug}`, String(index))
          setActiveSlideIndex(index)
        }}
        slides={[
          <TourPhotoSlide key="photo" tour={tour} />,
          ...itinerarySlides,
          <TourIncludesSlide
            key="includes"
            includes={tour.includes}
            packingItems={whatToBringFor(tour.slug)}
          />,
          <TourBookingSlide
            key="booking"
            tour={tour}
            guides={guides}
            guestCount={guestCount}
            onGuestCountChange={setGuestCount}
            initialItem={existingItem}
          />,
          <TourFaqSlide
            key="faq"
            items={faq}
            tours={tours}
            lockedTourId={tour.id}
            emptyMessage="Вопросов пока нет — задайте свой."
          />,
          <TourReviewsSlide
            key="reviews"
            reviews={reviews}
            tours={[]}
            guideId={primaryGuide?.id ?? null}
            guideName={primaryGuide?.name ?? null}
            lockedTourId={tour.id}
            emptyMessage="Пока нет отзывов об этом туре — станьте первым."
          />,
        ]}
      />

      {/* Скрыта opacity, не unmount: TourBottomBar всегда в DOM, чтобы
          useBottomBarHeightVar не терял ref её элемента. Место под неё
          на слайдах, где она видна, резервирует сам слайд (padding-bottom
          с --tour-bottom-bar-h — см. tour-itinerary-slide.tsx и т.п.), а
          не дека — высота деки теперь константа на всех слайдах. */}
      <TourBottomBar
        barRef={bottomBarRef}
        hidden={bottomBarHidden}
        priceAdultUsd={priceAdultUsd}
        ctaLabel="Выбрать дату"
        onCtaClick={() => swiperRef.current?.slideTo(bookingSlideIndex)}
      />
    </>
  )
}

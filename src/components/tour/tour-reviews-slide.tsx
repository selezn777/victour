"use client"

import { useRef } from "react"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import type { Review, TourOption } from "@/lib/reviews-data"

// Отзывы — теперь свой слайд в конце колоды, а не отдельный блок под ней
// (Виктор: "пусть будет не кнопка, а прям ещё один слайд для отзывов").
// Список внутри скроллится свободно (swiper-no-swiping — родительский
// вертикальный Swiper вообще не трогает тачи внутри), а когда список
// докручен до самого верха и человек всё равно тянет дальше вниз (жест
// "листнуть назад"), это единственный момент, когда мы САМИ включаем
// обратно механику слайдов и уходим на предыдущий слайд (FAQ) —
// swiperRef.slidePrev() по явному запросу onRequestPrevSlide.
const SWIPE_THRESHOLD = 40

export function TourReviewsSlide({
  reviews,
  tours,
  guideId,
  guideName,
  lockedTourId,
  emptyMessage,
  onRequestPrevSlide,
}: {
  reviews: Review[]
  tours: TourOption[]
  guideId: string | null
  guideName: string | null
  lockedTourId?: string
  emptyMessage: string
  onRequestPrevSlide: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<{ y: number; atTop: boolean } | null>(null)

  // Pointer events (не touch) — тот же приём, что уже проверен на
  // вертикальном свайпе по горизонтальному каталогу туров (slide-deck.tsx):
  // единообразно ловит и палец, и мышь/трекпад, без отдельной ветки под
  // touch-only устройства.
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current
    pointerRef.current = { y: e.clientY, atTop: !el || el.scrollTop <= 0 }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerRef.current
    pointerRef.current = null
    const el = scrollRef.current
    if (!start || !start.atTop || !el || el.scrollTop > 0) return
    const dy = e.clientY - start.y
    if (dy > SWIPE_THRESHOLD) onRequestPrevSlide()
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-24 sm:px-11 sm:pt-9">
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="swiper-no-swiping no-scrollbar min-h-0 flex-1 overflow-y-auto sm:mx-auto sm:w-full sm:max-w-xl"
      >
        <ReviewsSection
          title="Отзывы об этом туре"
          reviews={reviews}
          tours={tours}
          guideId={guideId}
          guideName={guideName}
          lockedTourId={lockedTourId}
          hideTarget="tour"
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  )
}

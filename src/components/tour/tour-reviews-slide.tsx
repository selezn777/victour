"use client"

import { useRef, type TouchEvent as ReactTouchEvent } from "react"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import type { Review, TourOption } from "@/lib/reviews-data"

// Отзывы — теперь свой слайд в конце колоды, а не отдельный блок под ней
// (Виктор: "пусть будет не кнопка, а прям ещё один слайд для отзывов").
//
// Виктор: "отзывы даже не открываются" — старая версия держалась на
// swiper-no-swiping + Pointer Events с ручным порогом (см. подробный
// разбор в tour-faq-slide.tsx — та же схема, тот же баг). Класс
// swiper-no-swiping решает "не мой жест" один раз при touchstart и потом
// игнорирует touchmove/touchend весь остаток жеста — работоспособность
// держалась только на Pointer-коде, а Pointer Events на мобильных
// браузерах ненадёжны. Новая схема: обычные touch-события, БЕЗ
// swiper-no-swiping. Пока в списке есть куда скроллить вверх — глушим
// touchmove; у верхней границы отпускаем событие Swiper'у, и он сам
// (своей штатной логикой) переключает на предыдущий слайд (FAQ) —
// вызывать slidePrev() руками больше не нужно.
export function TourReviewsSlide({
  reviews,
  tours,
  guideId,
  guideName,
  lockedTourId,
  emptyMessage,
}: {
  reviews: Review[]
  tours: TourOption[]
  guideId: string | null
  guideName: string | null
  lockedTourId?: string
  emptyMessage: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)

  function onTouchStart(e: ReactTouchEvent) {
    startYRef.current = e.touches[0].clientY
  }
  function onTouchMove(e: ReactTouchEvent) {
    const el = scrollRef.current
    if (!el) return
    const draggingDown = e.touches[0].clientY - startYRef.current > 0
    const atTop = el.scrollTop <= 0
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    const releaseToSwiper = (atTop && draggingDown) || (atBottom && !draggingDown)
    if (!releaseToSwiper) {
      e.stopPropagation()
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-24 sm:px-11 sm:pt-9">
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto sm:mx-auto sm:w-full sm:max-w-xl"
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

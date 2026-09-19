"use client"

import { useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from "react"
import { ReviewCard } from "@/components/reviews/review-card"
import { cn } from "@/lib/utils"
import type { Review } from "@/lib/reviews-data"

// Виктор: "уберите идею с пролистыванием вниз" — список отзывов внутри
// слайда колоды раньше был вертикально скроллящимся списком (тот же
// приём, что и в tour-includes-slide.tsx). Вместо этого — тот же паттерн,
// что уже давно и надёжно работает на главной (QuoteCarousel в
// advantages-section.tsx): один отзыв на экране, свайп ВБОК переключает
// на следующий/предыдущий. Горизонтальный жест не конфликтует с
// вертикальным Swiper'ом колоды (тот реагирует на вертикальную ось), так
// что отдельный touch-перехват тут не нужен — в отличие от вертикального
// скролла, который приходилось глушить вручную.
const SWIPE_THRESHOLD_PX = 40

function useReviewSlot(count: number) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [entering, setEntering] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setEntering(false), 20)
    return () => window.clearTimeout(id)
  }, [index])

  const advance = (dir: 1 | -1) => {
    setDirection(dir)
    setEntering(true)
    setIndex((i) => (i + dir + count) % count)
  }
  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1)
    setEntering(true)
    setIndex(i)
  }

  return {
    index,
    direction,
    entering,
    goTo,
    onTouchStart: (e: ReactTouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    },
    onTouchEnd: (e: ReactTouchEvent) => {
      if (touchStartX.current === null) return
      const delta = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
      advance(delta < 0 ? 1 : -1)
    },
  }
}

export function TourReviewCarousel({ reviews }: { reviews: Review[] }) {
  const slot = useReviewSlot(reviews.length)
  if (reviews.length === 0) return null
  const review = reviews[slot.index]

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col">
      <div
        className="flex min-h-0 flex-1 items-center overflow-hidden"
        onTouchStart={slot.onTouchStart}
        onTouchEnd={slot.onTouchEnd}
      >
        <div
          key={slot.index}
          className={`w-full transition-all duration-[380ms] ease-out ${
            slot.entering
              ? slot.direction === 1
                ? "translate-x-4 opacity-0"
                : "-translate-x-4 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          <ReviewCard review={review} hideTarget="tour" />
        </div>
      </div>

      {reviews.length > 1 && (
        <div className="mt-3 flex shrink-0 justify-center gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Отзыв ${i + 1}`}
              onClick={() => slot.goTo(i)}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === slot.index ? "bg-primary" : "bg-primary/25",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

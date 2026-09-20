"use client"

import { useRef, useState, type TouchEvent as ReactTouchEvent } from "react"
import { Button } from "@/components/ui/button"
import { ReviewForm } from "@/components/reviews/review-form"
import { TourReviewCarousel } from "@/components/tour/tour-review-carousel"
import type { Review, TourOption } from "@/lib/reviews-data"

// Отзывы — свой слайд в конце колоды (Виктор: "пусть будет не кнопка, а
// прям ещё один слайд для отзывов").
//
// Раньше тут был вертикально скроллящийся список отзывов — на телефоне
// список внутри слайда физически не скроллился (вертикальный Swiper
// колоды перехватывал тот же жест раньше внутреннего скролла). Виктор:
// "уберите идею с пролистыванием вниз, сделайте свайп вбок, как на
// главной" — заменил список на TourReviewCarousel: один отзыв на экране,
// свайп вбок переключает (тот же паттерн, что и QuoteCarousel в
// advantages-section.tsx). Горизонтальный жест не по той оси, что у
// вертикального Swiper'а колоды, так что конфликта жестов тут нет — сам
// просмотр отзывов теперь без какого-либо вертикального скролла.
//
// Форма "Оставить отзыв" — исключение: сама по себе длиннее экрана
// (рейтинг, текст, фото, выбор тура), скроллить её всё равно надо. Тот же
// touch-перехват, что и в tour-faq-slide.tsx — глушим вертикальный жест,
// пока внутри есть куда скроллить, у границы отпускаем Swiper'у.
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
  const [showForm, setShowForm] = useState(false)
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
    // pb-[calc(...+var(--tour-bottom-bar-h))] — резервирует место под
    // видимую на этом слайде нижнюю плашку сам слайд (высота деки — общая
    // константа на всех слайдах, см. tour-page-client.tsx).
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-[calc(1.5rem+var(--tour-bottom-bar-h))] sm:px-11 sm:pt-9">
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="no-scrollbar mx-auto flex w-full min-h-0 flex-1 flex-col overflow-y-auto sm:max-w-xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3">
          <h2 className="font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
            Отзывы об этом туре
          </h2>
          <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Отмена" : "Оставить отзыв"}
          </Button>
        </div>

        {showForm && (
          <div className="mt-4">
            <ReviewForm tours={tours} guideId={guideId} guideName={guideName} lockedTourId={lockedTourId} />
          </div>
        )}

        {!showForm &&
          (reviews.length > 0 ? (
            <TourReviewCarousel reviews={reviews} />
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">{emptyMessage}</p>
          ))}
      </div>
    </div>
  )
}

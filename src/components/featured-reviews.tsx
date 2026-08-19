"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { ReviewCard } from "@/components/reviews/review-card"
import { Reveal } from "@/components/motion/reveal"
import { Glow } from "@/components/glow"
import { ButtonComets } from "@/components/button-comets"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useOnceVisible } from "@/lib/use-once-visible"
import type { Review } from "@/lib/reviews-data"

const SWIPE_THRESHOLD_PX = 40

export function FeaturedReviews({ reviews, guideName }: { reviews: Review[]; guideName: string | null }) {
  const featured = [...reviews].sort((a, b) => (b.text?.length ?? 0) - (a.text?.length ?? 0)).slice(0, 3)
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const { ref: ctaRef, visible: ctaVisible } = useOnceVisible<HTMLAnchorElement>()

  if (featured.length === 0) return null

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    setActive((i) => (i + (delta < 0 ? 1 : -1) + featured.length) % featured.length)
  }

  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
      <Glow side="left" />
      <Reveal>
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Что говорят гости {guideName ? `о поездках с ${guideName}` : ""}
          </h2>
        </div>
      </Reveal>

      {/* Мобиль: по одной карточке, свайп в бок + точки — видно, что отзывов
          несколько и их можно листать (Виктор). На sm+ все три видны сразу
          в сетке, навигация там не нужна. */}
      <div className="mt-8 sm:hidden">
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <ReviewCard key={featured[active].id} review={featured[active]} hideTarget="guide" />
        </div>
        {featured.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {featured.map((review, i) => (
              <button
                key={review.id}
                type="button"
                aria-label={`Отзыв ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i === active ? "bg-primary" : "bg-primary/25",
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 hidden gap-3 sm:grid sm:grid-cols-3">
        {featured.map((review, i) => (
          <Reveal key={review.id} delay={i * 0.1} className="transition-transform hover:-translate-y-1">
            <ReviewCard review={review} hideTarget="guide" />
          </Reveal>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-6">
        <div className="relative inline-flex">
          <Link ref={ctaRef} href="/tours" className={cn(buttonVariants(), ctaVisible && "cta-blink-once")}>
            Выбрать тур
          </Link>
          <ButtonComets />
        </div>
        <Link href="/reviews" className="text-sm text-primary hover:underline">
          Все отзывы →
        </Link>
      </div>
    </section>
  )
}

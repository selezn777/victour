"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewForm } from "@/components/reviews/review-form"
import { cn } from "@/lib/utils"
import type { Review } from "@/lib/reviews-data"
import type { TourOption } from "@/lib/reviews-data"

type FilterValue = "all" | "guide" | `tour:${string}`

export function ReviewsSection({
  title,
  reviews,
  tours,
  guideId,
  guideName,
  lockedTourId,
  hideTarget,
  emptyMessage,
  className,
}: {
  title: string
  reviews: Review[]
  tours: TourOption[]
  guideId: string | null
  guideName: string | null
  lockedTourId?: string
  hideTarget?: "tour" | "guide"
  emptyMessage: string
  className?: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<FilterValue>("all")

  // Показываем фильтр по турам только там, где отзывов много и стоит их разбирать
  // (страница со всеми отзывами), а не в узких секциях типа "отзывы о туре".
  const showFilters = !hideTarget && !lockedTourId && reviews.length > 4

  const toursWithReviews = useMemo(() => {
    const idsWithReviews = new Set(reviews.map((r) => r.tourId).filter(Boolean))
    return tours.filter((t) => idsWithReviews.has(t.id))
  }, [reviews, tours])

  const filteredReviews = useMemo(() => {
    if (filter === "all") return reviews
    if (filter === "guide") return reviews.filter((r) => r.guideId && guideId && r.guideId === guideId)
    const tourId = filter.slice("tour:".length)
    return reviews.filter((r) => r.tourId === tourId)
  }, [reviews, filter, guideId])

  return (
    <section className={className}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">{title}</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Отмена" : "Оставить отзыв"}
        </Button>
      </div>

      {showForm && (
        <div className="mt-4">
          <ReviewForm tours={tours} guideId={guideId} guideName={guideName} lockedTourId={lockedTourId} />
        </div>
      )}

      {showFilters && toursWithReviews.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            Все ({reviews.length})
          </FilterPill>
          {guideId && guideName && (
            <FilterPill active={filter === "guide"} onClick={() => setFilter("guide")}>
              О гиде {guideName}
            </FilterPill>
          )}
          {toursWithReviews.map((t) => (
            <FilterPill key={t.id} active={filter === `tour:${t.id}`} onClick={() => setFilter(`tour:${t.id}`)}>
              {t.title}
            </FilterPill>
          ))}
        </div>
      )}

      <div className="mt-4">
        <ReviewList reviews={filteredReviews} hideTarget={hideTarget} emptyMessage={emptyMessage} />
      </div>
    </section>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}

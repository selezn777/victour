"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewForm } from "@/components/reviews/review-form"
import type { Review } from "@/lib/reviews-data"
import type { TourOption } from "@/lib/reviews-data"

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

      <div className="mt-4">
        <ReviewList reviews={reviews} hideTarget={hideTarget} emptyMessage={emptyMessage} />
      </div>
    </section>
  )
}

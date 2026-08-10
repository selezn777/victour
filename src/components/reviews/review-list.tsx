import { ReviewCard } from "@/components/reviews/review-card"
import type { Review } from "@/lib/reviews-data"

export function ReviewList({
  reviews,
  hideTarget,
  emptyMessage,
}: {
  reviews: Review[]
  hideTarget?: "tour" | "guide"
  emptyMessage: string
}) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} hideTarget={hideTarget} />
      ))}
    </div>
  )
}

import { cn } from "@/lib/utils"

/** «отзыв / отзыва / отзывов» */
export function reviewsWord(n: number): string {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return "отзыв"
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "отзыва"
  return "отзывов"
}

/** Средний рейтинг и количество отзывов тура (Виктор 26.11: «всем турам, у которых есть отзывы»). */
export function RatingBadge({ rating, count, className }: { rating: number; count: number; className?: string }) {
  if (!count) return null
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", className)}>
      <span className="text-amber-400">★</span>
      {rating.toFixed(1).replace(".", ",")}
      <span className="font-normal opacity-80">
        · {count} {reviewsWord(count)}
      </span>
    </span>
  )
}

export function ratingOf(reviews: { rating: number }[]): { rating: number; count: number } {
  const count = reviews.length
  return { count, rating: count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0 }
}

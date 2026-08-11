import Image from "next/image"
import Link from "next/link"
import { StarRatingDisplay } from "@/components/reviews/star-rating"
import type { Review } from "@/lib/reviews-data"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })
}

export function ReviewCard({ review, hideTarget }: { review: Review; hideTarget?: "tour" | "guide" }) {
  const initial = review.authorName.trim().charAt(0).toUpperCase() || "?"

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
            {initial}
          </div>
          <div>
            <div className="text-sm font-medium">{review.authorName}</div>
            <div className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</div>
          </div>
        </div>
        <StarRatingDisplay rating={review.rating} />
      </div>

      {review.text && <p className="text-sm text-foreground/90">{review.text}</p>}

      {review.audioUrl && <audio controls src={review.audioUrl} className="h-9 w-full" />}

      {review.photoUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          <Image src={review.photoUrl} alt="" fill className="object-cover" sizes="(min-width: 640px) 320px, 100vw" />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-primary/5 text-4xl">
          🌴
        </div>
      )}

      {(review.tourTitle && hideTarget !== "tour") || (review.guideName && hideTarget !== "guide") ? (
        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {review.tourTitle && hideTarget !== "tour" && (
            <Link
              href={`/tours/${review.tourSlug}`}
              className="rounded-full bg-muted px-2.5 py-1 hover:underline"
            >
              {review.tourTitle}
            </Link>
          )}
          {review.guideName && hideTarget !== "guide" && (
            <span className="rounded-full bg-muted px-2.5 py-1">Гид {review.guideName}</span>
          )}
        </div>
      ) : null}
    </div>
  )
}

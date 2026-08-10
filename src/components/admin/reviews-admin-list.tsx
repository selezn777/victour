"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StarRatingDisplay } from "@/components/reviews/star-rating"
import { createClient } from "@/lib/supabase/client"
import type { Review } from "@/lib/reviews-data"

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ReviewsAdminList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null

  return (
    <details className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      <summary className="cursor-pointer text-sm font-medium">Отзывы ({reviews.length})</summary>
      <div className="mt-4 flex flex-col gap-2">
        {reviews.map((review) => (
          <ReviewRow key={review.id} review={review} />
        ))}
      </div>
    </details>
  )
}

function ReviewRow({ review }: { review: Review }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function remove() {
    if (!confirm("Удалить отзыв безвозвратно?")) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from("reviews").delete().eq("id", review.id)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{review.authorName}</span>
          <StarRatingDisplay rating={review.rating} />
        </div>
        <div className="text-xs text-muted-foreground">
          {[review.tourTitle, review.guideName ? `гид ${review.guideName}` : null]
            .filter(Boolean)
            .join(" · ")}{" "}
          · {formatDateTime(review.createdAt)}
        </div>
        {review.text && <p className="mt-1 text-sm">{review.text}</p>}
      </div>
      <Button size="sm" variant="destructive" disabled={isPending} onClick={remove}>
        Удалить
      </Button>
    </div>
  )
}

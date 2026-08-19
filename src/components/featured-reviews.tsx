import Link from "next/link"
import { ReviewCard } from "@/components/reviews/review-card"
import { Reveal } from "@/components/motion/reveal"
import { Glow } from "@/components/glow"
import type { Review } from "@/lib/reviews-data"

export function FeaturedReviews({ reviews, guideName }: { reviews: Review[]; guideName: string | null }) {
  const featured = [...reviews].sort((a, b) => (b.text?.length ?? 0) - (a.text?.length ?? 0)).slice(0, 3)

  if (featured.length === 0) return null

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

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {featured.map((review, i) => (
          <Reveal key={review.id} delay={i * 0.1} className="transition-transform hover:-translate-y-1">
            <ReviewCard review={review} hideTarget="guide" />
          </Reveal>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Link href="/reviews" className="text-sm text-primary hover:underline">
          Все отзывы →
        </Link>
      </div>
    </section>
  )
}

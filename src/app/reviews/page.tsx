import Link from "next/link"
import type { Metadata } from "next"
import { getAllReviews, getTourOptions } from "@/lib/reviews-data"
import { getHomepageData } from "@/lib/site-data"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Отзывы — ВикТур",
}

export default async function ReviewsPage() {
  const [reviews, tours, { guide }] = await Promise.all([
    getAllReviews(),
    getTourOptions(),
    getHomepageData(),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← На главную
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">Отзывы гостей</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Отзывы о турах и о гиде — публикуются сразу после отправки.
      </p>

      <Link href="/tours" className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full sm:w-auto")}>
        Выбрать тур
      </Link>

      <div className="mt-6">
        <ReviewsSection
          title="Все отзывы"
          reviews={reviews}
          tours={tours}
          guideId={guide?.id ?? null}
          guideName={guide?.name ?? null}
          emptyMessage="Пока нет отзывов — станьте первым."
        />
      </div>
    </main>
  )
}

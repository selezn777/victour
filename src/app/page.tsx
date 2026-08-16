import { HomeClient } from "@/components/home-client"
import { getHomepageData } from "@/lib/site-data"
import { getReviewsForGuide, type Review } from "@/lib/reviews-data"

const HERO_QUOTES_COUNT = 6

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default async function Home() {
  const { settings, guide } = await getHomepageData()
  const guideReviews = guide ? await getReviewsForGuide(guide.id) : []

  // Случайная (на каждый запрос) подборка реальных отзывов для слайда-цитат
  // на главной — Виктор попросил, чтобы отзывы не были одним и тем же
  // зафиксированным набором, а подтягивались рандомно из всех реальных.
  const heroQuotes: Review[] = shuffled(guideReviews.filter((r) => r.text)).slice(0, HERO_QUOTES_COUNT)

  return <HomeClient settings={settings} guide={guide} guideReviews={guideReviews} heroQuotes={heroQuotes} />
}

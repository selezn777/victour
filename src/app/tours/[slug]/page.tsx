import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { TourPageClient } from "@/components/tour/tour-page-client"
import { getTourPageData } from "@/lib/site-data"
import { getReviewsForTour, getTourOptions } from "@/lib/reviews-data"
import { getGeneralFaq, getFaqForTour } from "@/lib/faq-data"

const loadTour = cache(getTourPageData)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await loadTour(slug)
  if (!data) return {}

  return {
    title: `${data.tour.title} — ВикТур`,
    description: data.tour.shortDescription,
  }
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await loadTour(slug)
  if (!data) notFound()

  const [reviews, generalFaq, tourFaq, tours] = await Promise.all([
    getReviewsForTour(data.tour.id),
    getGeneralFaq(),
    getFaqForTour(data.tour.id),
    getTourOptions(),
  ])
  const faq = [...tourFaq, ...generalFaq]

  return (
    <TourPageClient
      tour={data.tour}
      guides={data.guides}
      settings={data.settings}
      reviews={reviews}
      faq={faq}
      tours={tours}
    />
  )
}

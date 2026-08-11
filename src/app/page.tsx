import { HomeClient } from "@/components/home-client"
import { getHomepageData } from "@/lib/site-data"
import { getReviewsForGuide } from "@/lib/reviews-data"

export default async function Home() {
  const { settings, guide } = await getHomepageData()
  const guideReviews = guide ? await getReviewsForGuide(guide.id) : []

  return <HomeClient settings={settings} guide={guide} guideReviews={guideReviews} />
}

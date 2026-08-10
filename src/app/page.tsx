import { HomeClient } from "@/components/home-client"
import { getHomepageData } from "@/lib/site-data"
import { getReviewsForGuide, getTourOptions } from "@/lib/reviews-data"

export default async function Home() {
  const { tours, settings, guide } = await getHomepageData()
  const [guideReviews, tourOptions] = await Promise.all([
    guide ? getReviewsForGuide(guide.id) : Promise.resolve([]),
    getTourOptions(),
  ])

  return (
    <HomeClient
      tours={tours}
      settings={settings}
      guide={guide}
      guideReviews={guideReviews}
      tourOptions={tourOptions}
    />
  )
}

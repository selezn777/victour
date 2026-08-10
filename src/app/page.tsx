import { HomeClient } from "@/components/home-client"
import { getHomepageData } from "@/lib/site-data"

export default async function Home() {
  const { tours, settings, guide } = await getHomepageData()

  return <HomeClient tours={tours} settings={settings} guide={guide} />
}

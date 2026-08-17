import type { Metadata } from "next"
import { getHomepageData } from "@/lib/site-data"
import { ToursPageClient } from "@/components/tours-page-client"

export const metadata: Metadata = {
  title: "Туры — ВикТур",
}

export default async function ToursPage() {
  const { tours, settings, guide } = await getHomepageData()

  return <ToursPageClient tours={tours} settings={settings} guide={guide} />
}

import type { Metadata } from "next"
import { getHomepageData } from "@/lib/site-data"
import { ToursPageClient } from "@/components/tours-page-client"

export const metadata: Metadata = {
  title: "Туры — ВикТур",
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; favorites?: string }>
}) {
  const { tours, settings, guide } = await getHomepageData()
  const { q, favorites } = await searchParams

  return (
    <ToursPageClient
      tours={tours}
      settings={settings}
      guide={guide}
      initialQuery={q ?? ""}
      initialFavoritesOnly={favorites === "1"}
    />
  )
}

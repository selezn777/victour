import type { Metadata } from "next"
import { getHomepageData } from "@/lib/site-data"
import { ToursPageClient } from "@/components/tours-page-client"

export const metadata: Metadata = {
  title: "Туры — ВикТур",
}

// Каталог перечитывает туры из Supabase раз в 5 минут: без этого страница
// запекалась на билде, а данные fetch-кэша переживали даже новые билды
// (новый тур Фукуока не появлялся в каталоге).
export const revalidate = 300

export default async function ToursPage() {
  const { tours, settings, guide } = await getHomepageData()

  return <ToursPageClient tours={tours} settings={settings} guide={guide} />
}

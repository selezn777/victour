import type { Metadata } from "next"
import { getHomepageData } from "@/lib/site-data"
import { SiteHeader } from "@/components/site-header"
import { TripsClient } from "./trips-client"

export const metadata: Metadata = {
  title: "Мои поездки | ВикТур",
  robots: { index: false, follow: false },
}

export default async function TripsPage() {
  const { settings, guide } = await getHomepageData()
  return (
    <>
      <SiteHeader settings={settings} guide={guide} />
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">🧳 Мои поездки</h1>
        <p className="mt-1 text-sm text-muted-foreground">Что забронировано, когда и куда едем. Если планы поменялись - напишите прямо отсюда.</p>
        <TripsClient />
      </main>
    </>
  )
}

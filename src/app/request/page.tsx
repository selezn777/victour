import type { Metadata } from "next"
import { getRequestPageData } from "@/lib/site-data"
import { RequestPageClient } from "@/components/request/request-page-client"

export const metadata: Metadata = {
  title: "Заявка — ВикТур",
  description: "Пакет туров, расчёт цены и оформление заявки на бронирование.",
}

export default async function RequestPage() {
  const { settings, surcharges } = await getRequestPageData()
  return <RequestPageClient settings={settings} surcharges={surcharges} />
}

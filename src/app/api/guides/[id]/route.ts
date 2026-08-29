import { getGuideById } from "@/lib/guides-data"
import { getReviewsForGuide } from "@/lib/reviews-data"

// Используется поп-апом профиля гида на слайде брони (tour-booking-slide) —
// та же страница /guides/[id] полноэкранная и серверная, а бронь клиентская
// и не должна терять состояние (дата/гости/степпер) при переходе на другую
// страницу, поэтому профиль+отзывы догружаются сюда отдельным запросом.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guide = await getGuideById(id)
  if (!guide) {
    return Response.json({ error: "not found" }, { status: 404 })
  }
  const reviews = await getReviewsForGuide(id)
  return Response.json({ guide, reviews })
}

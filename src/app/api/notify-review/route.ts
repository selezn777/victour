import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

const POSITIVE_RATING_THRESHOLD = 4

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: Request) {
  const { reviewId } = (await request.json()) as { reviewId?: string }
  if (!reviewId) {
    return Response.json({ ok: false, error: "missing reviewId" }, { status: 400 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    return Response.json({ ok: false, error: "telegram not configured" }, { status: 500 })
  }

  const supabase = serviceClient()

  const { data: review, error } = await supabase
    .from("reviews")
    .select(
      "id, admin_notified_at, author_name, rating, text, photo_url, audio_url, tours(title), guides(name)",
    )
    .eq("id", reviewId)
    .single()

  if (error || !review) {
    return Response.json({ ok: false, error: "review not found" }, { status: 404 })
  }

  if (review.admin_notified_at || review.rating < POSITIVE_RATING_THRESHOLD) {
    return Response.json({ ok: true, skipped: true })
  }

  const tourTitle = (review.tours as unknown as { title: { ru: string } } | null)?.title.ru
  const guideName = (review.guides as unknown as { name: string } | null)?.name

  const text = [
    "⭐ Новый отзыв на сайте",
    "",
    `${review.author_name} — ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`,
    [tourTitle, guideName ? `гид ${guideName}` : null].filter(Boolean).join(" · "),
    review.text ? `\n«${review.text}»` : "",
    review.photo_url ? "\n📷 есть фото" : "",
    review.audio_url ? "\n🎤 есть аудио" : "",
  ]
    .filter(Boolean)
    .join("\n")

  const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!telegramRes.ok) {
    return Response.json({ ok: false, error: "telegram send failed" }, { status: 502 })
  }

  await supabase
    .from("reviews")
    .update({ admin_notified_at: new Date().toISOString() })
    .eq("id", reviewId)

  return Response.json({ ok: true })
}

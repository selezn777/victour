import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: Request) {
  const { questionId } = (await request.json()) as { questionId?: string }
  if (!questionId) {
    return Response.json({ ok: false, error: "missing questionId" }, { status: 400 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    return Response.json({ ok: false, error: "telegram not configured" }, { status: 500 })
  }

  const supabase = serviceClient()

  const { data: item, error } = await supabase
    .from("faq_items")
    .select("id, admin_notified_at, question, tours(title)")
    .eq("id", questionId)
    .single()

  if (error || !item) {
    return Response.json({ ok: false, error: "question not found" }, { status: 404 })
  }

  if (item.admin_notified_at) {
    return Response.json({ ok: true, skipped: true })
  }

  const tourTitle = (item.tours as unknown as { title: { ru: string } } | null)?.title.ru

  const text = [
    "❓ Новый вопрос на сайте",
    "",
    tourTitle ? `Про тур: ${tourTitle}` : "Общий вопрос",
    `«${item.question}»`,
    "",
    "Ответить можно в админке — вопрос появится в FAQ сразу после ответа.",
  ].join("\n")

  const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!telegramRes.ok) {
    return Response.json({ ok: false, error: "telegram send failed" }, { status: 502 })
  }

  await supabase
    .from("faq_items")
    .update({ admin_notified_at: new Date().toISOString() })
    .eq("id", questionId)

  return Response.json({ ok: true })
}

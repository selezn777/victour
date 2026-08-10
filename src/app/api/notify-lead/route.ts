import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const CONTACT_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  max: "MAX",
  vk: "ВКонтакте",
}

export async function POST(request: Request) {
  const { contactValue } = (await request.json()) as { contactValue?: string }
  if (!contactValue) {
    return Response.json({ ok: false, error: "missing contactValue" }, { status: 400 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    return Response.json({ ok: false, error: "telegram not configured" }, { status: 500 })
  }

  const supabase = serviceClient()

  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, notified_at, contact_channel, contact_value, tour_interest, source")
    .eq("contact_value", contactValue)
    .single()

  if (error || !lead) {
    return Response.json({ ok: false, error: "lead not found" }, { status: 404 })
  }

  if (lead.notified_at) {
    return Response.json({ ok: true, skipped: true })
  }

  const text = [
    "👀 Незавершённый контакт на сайте",
    "",
    `${CONTACT_LABELS[lead.contact_channel] ?? lead.contact_channel}: ${lead.contact_value}`,
    lead.tour_interest ? `Смотрел: ${lead.tour_interest}` : "",
    "",
    "Не дозаполнил заявку — можно написать и предложить помочь с бронью.",
  ]
    .filter(Boolean)
    .join("\n")

  const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  const telegramData = (await telegramRes.json()) as {
    ok: boolean
    result?: { message_id: number }
  }

  if (!telegramRes.ok || !telegramData.ok) {
    return Response.json({ ok: false, error: "telegram send failed" }, { status: 502 })
  }

  await supabase
    .from("leads")
    .update({
      notified_at: new Date().toISOString(),
      telegram_message_id: telegramData.result?.message_id ?? null,
    })
    .eq("id", lead.id)

  return Response.json({ ok: true })
}

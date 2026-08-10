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

const STALE_MINUTES = 2

export async function GET(request: Request) {
  if (process.env.CRON_SECRET) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    return Response.json({ ok: false, error: "telegram not configured" }, { status: 500 })
  }

  const supabase = serviceClient()
  const staleBefore = new Date(Date.now() - STALE_MINUTES * 60_000).toISOString()

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, contact_channel, contact_value, tour_interest, created_at")
    .is("notified_at", null)
    .lte("created_at", staleBefore)

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const lead of leads ?? []) {
    // Гость дозаполнил заявку до конца — отдельное уведомление о заявке уже
    // покрывает этот контакт, дублировать "незавершённый" не нужно.
    const { data: matchingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("contact_value", lead.contact_value)
      .gte("created_at", lead.created_at)
      .limit(1)
      .maybeSingle()

    if (matchingBooking) {
      await supabase
        .from("leads")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", lead.id)
      skipped++
      continue
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

    if (telegramRes.ok) {
      await supabase
        .from("leads")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", lead.id)
      sent++
    }
  }

  return Response.json({ ok: true, sent, skipped })
}

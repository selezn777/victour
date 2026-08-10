import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

const CONTACT_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  max: "MAX",
  vk: "ВКонтакте",
}

export async function POST(request: Request) {
  const { bookingId } = (await request.json()) as { bookingId?: string }
  if (!bookingId) {
    return Response.json({ ok: false, error: "missing bookingId" }, { status: 400 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    return Response.json({ ok: false, error: "telegram not configured" }, { status: 500 })
  }

  const supabase = serviceClient()

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, admin_notified_at, guest_name, contact_channel, contact_value, hotel, notes, total_usd, prepayment_usd, booking_items(date, date_end, adults, children, tours(title))",
    )
    .eq("id", bookingId)
    .single()

  if (error || !booking) {
    return Response.json({ ok: false, error: "booking not found" }, { status: 404 })
  }

  if (booking.admin_notified_at) {
    return Response.json({ ok: true, skipped: true })
  }

  const items = booking.booking_items
    .map((item) => {
      const title = (item.tours as unknown as { title: { ru: string } } | null)?.title.ru ?? "Тур"
      const dates = item.date_end
        ? `${formatDate(item.date)} — ${formatDate(item.date_end)}`
        : formatDate(item.date)
      const guests = item.children > 0 ? `${item.adults} взр. + ${item.children} дет.` : `${item.adults} взр.`
      return `• ${title} — ${dates} (${guests})`
    })
    .join("\n")

  const text = [
    "🆕 Новая заявка ВикТур",
    "",
    `Гость: ${booking.guest_name}`,
    `${CONTACT_LABELS[booking.contact_channel] ?? booking.contact_channel}: ${booking.contact_value}`,
    `Отель: ${booking.hotel}`,
    "",
    items,
    "",
    `Итого: $${booking.total_usd} · предоплата: $${booking.prepayment_usd}`,
    booking.notes ? `\nКомментарий: ${booking.notes}` : "",
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
    .from("bookings")
    .update({ admin_notified_at: new Date().toISOString() })
    .eq("id", bookingId)

  return Response.json({ ok: true })
}

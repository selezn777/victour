import { createClient as createServiceClient } from "@supabase/supabase-js"
import { readConfirmToken, confirmSummaryRu } from "@/lib/park-confirm"

// «Запросить изменение» со страницы «Мои поездки» — сообщение Виктору в Telegram.
// Принимаем только реальную заявку (uuid из базы) или подписанный токен билета,
// чтобы форма не стала открытой рассылкой в его чат.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const hits = new Map<string, number[]>()

function limited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000)
  list.push(now)
  hits.set(ip, list)
  return list.length > 5
}

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("ru-RU", { timeZone: "UTC", day: "numeric", month: "long" })

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (limited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 })

  const body = (await request.json().catch(() => ({}))) as { kind?: string; ref?: string; message?: string }
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : ""
  if (!message || typeof body.ref !== "string") return Response.json({ ok: false, error: "validation" }, { status: 400 })

  let about: string | null = null
  if (body.kind === "booking" && UUID.test(body.ref)) {
    const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    })
    const { data } = await db
      .from("bookings")
      .select("guest_name, contact_channel, contact_value, hotel, booking_items(date, adults, children, tours(title))")
      .eq("id", body.ref)
      .single()
    if (data) {
      const b = data as unknown as {
        guest_name: string
        contact_channel: string
        contact_value: string
        hotel: string
        booking_items: { date: string; adults: number; children: number; tours: { title: { ru: string } } | null }[]
      }
      const items = b.booking_items
        .map((i) => `• ${esc(i.tours?.title.ru ?? "Тур")} - ${fmt(i.date)}, ${i.adults + i.children} чел.`)
        .join("\n")
      about = `${items}\n👤 ${esc(b.guest_name)}, ${esc(b.contact_channel)}: ${esc(b.contact_value)}\n🏨 ${esc(b.hotel)}`
    }
  } else if (body.kind === "park") {
    const d = readConfirmToken(body.ref)
    if (d) about = `• ${esc(confirmSummaryRu(d))}\n👤 ${esc(d.name)}, ${esc(d.contact)}\n🏨 ${esc(d.hotel)}`
  }
  if (!about) return Response.json({ ok: false, error: "not_found" }, { status: 404 })

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return Response.json({ ok: false, error: "telegram not configured" }, { status: 500 })

  const text = `✏️ <b>Турист просит изменить поездку</b>\n${about}\n\n💬 ${esc(message)}`
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
  if (!res.ok) return Response.json({ ok: false, error: "telegram" }, { status: 502 })
  return Response.json({ ok: true })
}

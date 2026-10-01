import { validateParkBooking } from "@/app/park/park-config"
import { buildParkBookingMessage } from "@/lib/park-booking-message"
import { confirmDataFromBooking, createConfirmToken } from "@/lib/park-confirm"

// Простое ограничение частоты: не больше RATE_LIMIT заявок с одного IP за
// RATE_WINDOW_MS. Память живёт в рамках одного инстанса функции — от
// случайного спама хватает, от целенаправленной атаки не защищает.
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000
const recentByIp = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    recentByIp.set(ip, recent)
    return true
  }
  recent.push(now)
  recentByIp.set(ip, recent)
  if (recentByIp.size > 1000) {
    for (const [key, times] of recentByIp) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) recentByIp.delete(key)
    }
  }
  return false
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 })
  }

  // Honeypot: живой человек это поле не видит и не заполняет. Боту отвечаем
  // "успехом", чтобы он не пробовал снова.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (isRateLimited(ip)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 })
  }

  const result = validateParkBooking(body)
  if (!result.ok) {
    return Response.json({ ok: false, error: "validation", errors: result.errors }, { status: 400 })
  }
  const booking = result.data

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    console.error("park-booking: telegram not configured, booking:", JSON.stringify(booking))
    return Response.json({ ok: false, error: "telegram_failed" }, { status: 500 })
  }

  const token = createConfirmToken(confirmDataFromBooking(booking))
  const origin = new URL(request.url).origin
  const confirmUrl = token ? `${origin}/park/confirm/${token}` : null
  const text = await buildParkBookingMessage(booking, confirmUrl)

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(10000),
    })
    const data = (await res.json()) as { ok: boolean; description?: string }
    if (!res.ok || !data.ok) {
      // Заявку логируем целиком, чтобы её можно было восстановить из логов Vercel
      console.error(
        "park-booking: telegram send failed:",
        res.status,
        data.description,
        "booking:",
        JSON.stringify(booking),
      )
      return Response.json({ ok: false, error: "telegram_failed" }, { status: 502 })
    }
  } catch (err) {
    console.error("park-booking: telegram request error:", err, "booking:", JSON.stringify(booking))
    return Response.json({ ok: false, error: "telegram_failed" }, { status: 502 })
  }

  return Response.json({ ok: true, confirmToken: token })
}

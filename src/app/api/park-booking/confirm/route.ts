import { buildParkConfirmedMessage } from "@/lib/park-booking-message"
import { readConfirmToken } from "@/lib/park-confirm"

// Турист нажал «Подтверждаю выезд» — сообщаем Виктору в Telegram.
// Повторы по той же ссылке в течение 30 минут не дублируем (память инстанса).
const DEDUPE_MS = 30 * 60 * 1000
const recentlyConfirmed = new Map<string, number>()

export async function POST(request: Request) {
  const { token } = (await request.json().catch(() => ({}))) as { token?: string }
  const data = typeof token === "string" ? readConfirmToken(token) : null
  if (!data || typeof token !== "string") {
    return Response.json({ ok: false, error: "invalid_token" }, { status: 400 })
  }

  const now = Date.now()
  for (const [key, at] of recentlyConfirmed) if (now - at > DEDUPE_MS) recentlyConfirmed.delete(key)
  if (recentlyConfirmed.has(token)) return Response.json({ ok: true, duplicate: true })

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    console.error("park-confirm: telegram not configured, confirm:", JSON.stringify(data))
    return Response.json({ ok: false, error: "telegram_failed" }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildParkConfirmedMessage(data),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(10000),
    })
    const body = (await res.json()) as { ok: boolean; description?: string }
    if (!res.ok || !body.ok) {
      console.error("park-confirm: telegram failed:", res.status, body.description, JSON.stringify(data))
      return Response.json({ ok: false, error: "telegram_failed" }, { status: 502 })
    }
  } catch (err) {
    console.error("park-confirm: telegram request error:", err, JSON.stringify(data))
    return Response.json({ ok: false, error: "telegram_failed" }, { status: 502 })
  }
  recentlyConfirmed.set(token, now)
  return Response.json({ ok: true })
}

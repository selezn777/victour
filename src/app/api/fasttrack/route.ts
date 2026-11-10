import { after } from "next/server"
import { validateFtBooking } from "@/lib/fasttrack"
import {
  createUploadToken,
  fasttrackMessage,
  fasttrackSummaryRu,
  newRef,
  saveFasttrackLead,
  sendTelegram,
} from "@/lib/fasttrack-server"

// Заявка на фаст-трек: сообщение Виктору в Telegram + лид в CRM.
// В ответ - токен, с которым форма отправляет паспорта по одному (/api/fasttrack/passport).

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000
const recentByIp = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) return true
  recent.push(now)
  recentByIp.set(ip, recent)
  if (recentByIp.size > 1000) recentByIp.clear()
  return false
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 })
  }
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true })

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (isRateLimited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 })

  const result = validateFtBooking(body)
  if (!result.ok) return Response.json({ ok: false, error: "validation", errors: result.errors }, { status: 400 })
  const b = result.data

  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) return Response.json({ ok: false, error: "telegram_failed" }, { status: 500 })

  const ref = newRef()
  const sent = await sendTelegram(
    "sendMessage",
    JSON.stringify({ chat_id: chatId, text: fasttrackMessage(b, ref), parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
  )
  if (!sent) {
    console.error("fasttrack: booking not delivered:", JSON.stringify(b))
    return Response.json({ ok: false, error: "telegram_failed" }, { status: 502 })
  }
  after(() => saveFasttrackLead(b, ref))

  return Response.json({ ok: true, ref, uploadToken: createUploadToken(ref, b.name), summary: fasttrackSummaryRu(b, ref) })
}

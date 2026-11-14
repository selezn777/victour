import { sendAdminHtml } from "@/lib/admin-bot-files"
import { validateFtBooking } from "@/lib/fasttrack"
import { createUploadToken, fasttrackMessage, fasttrackSummaryRu, newRef, saveFasttrackLead } from "@/lib/fasttrack-server"

// Заявка на фаст-трек (мастер на /fasttrack): лид в CRM + сообщение Виктору в админ-бот
// (если не настроен - в основной @victour_bot). Telegram не обязателен: если он упал,
// заявка всё равно в CRM, турист видит «принято». В ответ - токен для загрузки файлов
// по одному (/api/fasttrack/file), они придут ответами на сообщение заявки.

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
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true, ref: "FT-OK", delivered: true, uploadToken: null })

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (isRateLimited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 })

  const result = validateFtBooking(body)
  if (!result.ok) return Response.json({ ok: false, error: "validation", errors: result.errors, step: result.step }, { status: 400 })
  const b = result.data
  const files = {
    passports: Math.max(0, Math.min(50, Number(body.passportCount) || 0)),
    vouchers: Math.max(0, Math.min(10, Number(body.voucherCount) || 0)),
  }

  const ref = newRef()
  const [sent, saved] = await Promise.all([sendAdminHtml(fasttrackMessage(b, ref, files)), saveFasttrackLead(b, ref)])
  if (!sent && !saved) {
    console.error("fasttrack: booking not delivered:", ref, JSON.stringify(b))
    return Response.json({ ok: false, error: "failed" }, { status: 502 })
  }
  return Response.json({
    ok: true,
    ref,
    delivered: !!sent,
    uploadToken: sent ? createUploadToken({ ref, name: b.passengers[0].en || b.passengers[0].ru, ...sent }) : null,
    summary: fasttrackSummaryRu(b, ref),
  })
}

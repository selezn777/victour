import { sendAdminDocument, sendAdminHtml } from "@/lib/admin-bot-files"
import { FT_FILE_TYPES, FT_MAX_FILE_BYTES, validateFtBooking } from "@/lib/fasttrack"
import { createUploadToken, fasttrackMessage, fasttrackSummaryRu, newRef, saveFasttrackLead } from "@/lib/fasttrack-server"

// Заявка на фаст-трек (мастер на /fasttrack): лид в CRM + сообщение Виктору в админ-бот
// (если не настроен - в основной @victour_bot). Telegram не обязателен: если он упал,
// заявка всё равно в CRM, турист видит «принято». В ответ - токен для загрузки файлов
// по одному (/api/fasttrack/file), они придут ответами на сообщение заявки.

// Виктор 14.11: с телефона в роуминге файлы «не грузились» отдельными запросами.
// Теперь заявка и все файлы приходят одним multipart-запросом, сервер сразу пересылает
// их в бота параллельно (ответами на сообщение заявки). JSON без файлов тоже принимаем.
export const maxDuration = 60

type InFile = { kind: "passport" | "voucher"; index: number; name: string; file: File }

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
  const inFiles: InFile[] = []
  try {
    if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const form = await request.formData()
      body = JSON.parse(String(form.get("booking") ?? "{}")) as Record<string, unknown>
      for (const [key, v] of form.entries()) {
        const m = /^(p|v)_(\d{1,2})$/.exec(key)
        if (!m || !(v instanceof File) || !FT_FILE_TYPES.includes(v.type) || v.size === 0 || v.size > FT_MAX_FILE_BYTES) continue
        const index = Number(m[2])
        const name = String(form.get(`pn_${index}`) ?? "").replace(/[^\p{L}\s'-]/gu, "").trim().slice(0, 80)
        inFiles.push({ kind: m[1] === "p" ? "passport" : "voucher", index, name: m[1] === "p" ? name : "", file: v })
      }
      if (inFiles.length > 20) inFiles.length = 20
    } else body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 })
  }
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true, ref: "FT-OK", delivered: true, uploadToken: null })

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (isRateLimited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 })

  const result = validateFtBooking(body)
  if (!result.ok) return Response.json({ ok: false, error: "validation", errors: result.errors, step: result.step }, { status: 400 })
  const b = result.data
  const files = inFiles.length
    ? { passports: inFiles.filter((f) => f.kind === "passport").length, vouchers: inFiles.filter((f) => f.kind === "voucher").length }
    : {
        passports: Math.max(0, Math.min(50, Number(body.passportCount) || 0)),
        vouchers: Math.max(0, Math.min(10, Number(body.voucherCount) || 0)),
      }

  const ref = newRef()
  const [sent, saved] = await Promise.all([sendAdminHtml(fasttrackMessage(b, ref, files)), saveFasttrackLead(b, ref)])
  if (!sent && !saved) {
    console.error("fasttrack: booking not delivered:", ref, JSON.stringify(b))
    return Response.json({ ok: false, error: "failed" }, { status: 502 })
  }
  // файлы из этого же запроса - сразу в бота, параллельно
  const failed: { kind: string; index: number }[] = []
  let filesSent = 0
  if (inFiles.length) {
    const name = b.passengers[0].en || b.passengers[0].ru
    const results = sent
      ? await Promise.all(
          inFiles.map((f) => {
            const ext = f.file.type === "application/pdf" ? "pdf" : f.file.type.split("/")[1].replace("jpeg", "jpg")
            const label = f.kind === "voucher" ? "🏨 Ваучер отеля" : "🛂 Паспорт"
            return sendAdminDocument(f.file, `${ref}-${f.kind}-${f.index}.${ext}`, {
              caption: `${label} ${f.index}${f.name ? ` - ${f.name}` : ""} · ${ref} · ${name}`,
              replyTo: sent.messageId,
              via: sent.via,
            })
          }),
        )
      : inFiles.map(() => false)
    results.forEach((ok, i) => (ok ? filesSent++ : failed.push({ kind: inFiles[i].kind, index: inFiles[i].index })))
  }
  return Response.json({
    ok: true,
    ref,
    filesSent,
    filesFailed: failed,
    delivered: !!sent,
    uploadToken: sent ? createUploadToken({ ref, name: b.passengers[0].en || b.passengers[0].ru, ...sent }) : null,
    summary: fasttrackSummaryRu(b, ref),
  })
}

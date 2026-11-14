import { sendAdminDocument } from "@/lib/admin-bot-files"
import { FT_FILE_TYPES, FT_MAX_FILE_BYTES, FT_MAX_PASSPORTS, FT_MAX_VOUCHERS } from "@/lib/fasttrack"
import { readUploadToken } from "@/lib/fasttrack-server"

// Паспорт или ваучер отеля к заявке на фаст-трек: файл сразу уходит Виктору в Telegram
// документом (без сжатия, чтобы агентство могло прочитать), ответом на сообщение заявки.
// На сайте файл не сохраняется. Один файл на запрос (лимит тела Vercel ~4.5 МБ).

const countByRef = new Map<string, number>()

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return Response.json({ ok: false, error: "invalid form" }, { status: 400 })
  }
  const token = form.get("token")
  const file = form.get("file")
  const kind = form.get("kind") === "voucher" ? "voucher" : "passport"
  const index = Math.max(1, Math.min(50, Number(form.get("index")) || 1))
  const who = String(form.get("name") ?? "").replace(/[^\p{L}\s'-]/gu, "").trim().slice(0, 80)
  const data = typeof token === "string" ? readUploadToken(token) : null
  if (!data) return Response.json({ ok: false, error: "expired" }, { status: 403 })
  if (!(file instanceof File) || !FT_FILE_TYPES.includes(file.type) || file.size === 0 || file.size > FT_MAX_FILE_BYTES) {
    return Response.json({ ok: false, error: "bad_file" }, { status: 400 })
  }
  const n = (countByRef.get(data.ref) ?? 0) + 1
  if (n > FT_MAX_PASSPORTS + FT_MAX_VOUCHERS) return Response.json({ ok: false, error: "too_many" }, { status: 429 })
  countByRef.set(data.ref, n)
  if (countByRef.size > 2000) countByRef.clear()

  const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1].replace("jpeg", "jpg")
  const label = kind === "voucher" ? "🏨 Ваучер отеля" : "🛂 Паспорт"
  const ok = await sendAdminDocument(file, `${data.ref}-${kind}-${index}.${ext}`, {
    caption: `${label} ${index}${who ? ` - ${who}` : ""} · ${data.ref} · ${data.name}`,
    replyTo: data.messageId ?? undefined,
    via: data.via,
  })
  return ok ? Response.json({ ok: true }) : Response.json({ ok: false, error: "telegram_failed" }, { status: 502 })
}

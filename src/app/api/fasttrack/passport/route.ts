import { FT_MAX_PASSPORTS } from "@/lib/fasttrack"
import { readUploadToken, sendTelegram } from "@/lib/fasttrack-server"

// Паспорт к заявке на фаст-трек: файл сразу уходит Виктору в Telegram документом
// (без сжатия, чтобы агентство могло прочитать) и на сайте не сохраняется.

const MAX_BYTES = 4 * 1024 * 1024
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
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
  const data = typeof token === "string" ? readUploadToken(token) : null
  if (!data) return Response.json({ ok: false, error: "expired" }, { status: 403 })
  if (!(file instanceof File) || !TYPES.includes(file.type) || file.size === 0 || file.size > MAX_BYTES) {
    return Response.json({ ok: false, error: "bad_file" }, { status: 400 })
  }
  const n = (countByRef.get(data.ref) ?? 0) + 1
  if (n > FT_MAX_PASSPORTS) return Response.json({ ok: false, error: "too_many" }, { status: 429 })
  countByRef.set(data.ref, n)
  if (countByRef.size > 2000) countByRef.clear()

  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) return Response.json({ ok: false, error: "telegram_failed" }, { status: 500 })
  const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1].replace("jpeg", "jpg")
  const tg = new FormData()
  tg.set("chat_id", chatId)
  tg.set("caption", `🛂 Паспорт ${n} · ${data.ref} · ${data.name}`)
  tg.set("document", file, `${data.ref}-passport-${n}.${ext}`)
  const ok = await sendTelegram("sendDocument", tg, false)
  return ok ? Response.json({ ok: true }) : Response.json({ ok: false, error: "telegram_failed" }, { status: 502 })
}

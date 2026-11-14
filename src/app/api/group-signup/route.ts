import { after } from "next/server"
import { sendAdmin } from "@/lib/admin-bot"
import { getOpenDepartureById, isMissingTable, seatsLeft, serviceDb, type GroupDeparture } from "@/lib/group-departures"
import { formatDateRu, todayInVietnam } from "@/lib/group-schedule-parse"

// «Записаться в группу» с /groups: заявка Виктору в админ-бот (или в основной бот, если
// админ-бот ещё не настроен) + строка в group_signups + лид в CRM (crm_clients).
// Места автоматически не занимаем: Виктор подтверждает человека и пишет боту /seats N +2.

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

type Signup = {
  departureId: string
  people: number
  name: string
  contactChannel: "whatsapp" | "telegram"
  contact: string
  comment: string
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

function validate(body: Record<string, unknown>): { ok: true; data: Signup } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const departureId = str(body.departureId, 64)
  const people = Number(body.people)
  const name = str(body.name, 80)
  const contactChannel = body.contactChannel === "telegram" ? "telegram" : "whatsapp"
  const contact = str(body.contact, 80)
  if (!departureId) errors.departure = "Выберите выезд"
  if (!Number.isInteger(people) || people < 1 || people > 20) errors.people = "Сколько вас?"
  if (name.length < 2) errors.name = "Как к вам обращаться?"
  if (contactChannel === "whatsapp" ? contact.replace(/\D/g, "").length < 8 : contact.replace(/[@\s]/g, "").length < 3)
    errors.contact = contactChannel === "whatsapp" ? "Номер WhatsApp с кодом страны" : "Ник или номер в Telegram"
  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, data: { departureId, people, name, contactChannel, contact, comment: str(body.comment, 500) } }
}

function label(d: GroupDeparture): string {
  return `${formatDateRu(d.date)}${d.time ? ` ${d.time}` : ""} · ${d.tourTitle}`
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

  const v = validate(body)
  if (!v.ok) return Response.json({ ok: false, error: "validation", errors: v.errors }, { status: 400 })
  const s = v.data

  const d = await getOpenDepartureById(s.departureId)
  if (!d) return Response.json({ ok: false, error: "departure_gone" }, { status: 409 })
  const left = seatsLeft(d)
  if (left === 0) return Response.json({ ok: false, error: "full" }, { status: 409 })
  if (s.people > left) {
    return Response.json({ ok: false, error: "validation", errors: { people: `Свободно мест: ${left}` } }, { status: 400 })
  }

  const text = [
    "👥 Запись в группу",
    "",
    `#${d.num} · ${label(d)}`,
    d.guideName ? `Гид: ${d.guideName}` : null,
    `Человек: ${s.people} (свободно было ${left} из ${d.seatsTotal})`,
    d.priceUsd !== null ? `Сумма: $${d.priceUsd * s.people}` : null,
    "",
    `${s.name} · ${s.contactChannel === "whatsapp" ? "WhatsApp" : "Telegram"}: ${s.contact}`,
    s.comment ? `Комментарий: ${s.comment}` : null,
    "",
    `Подтвердили - отметьте места: /seats ${d.num} +${s.people}`,
  ]
    .filter((l) => l !== null)
    .join("\n")

  const sent = await sendAdmin(text, { fallbackToMainBot: true })
  if (!sent) {
    console.error("group-signup: not delivered:", JSON.stringify({ ...s, departure: label(d) }))
    return Response.json({ ok: false, error: "telegram_failed" }, { status: 502 })
  }

  after(() => saveSignup(s, d))

  const summary = [
    `Хочу в группу: ${label(d)}`,
    `Нас ${s.people}${d.priceUsd !== null ? `, $${d.priceUsd} с человека` : ""}`,
    `Меня зовут ${s.name}`,
  ].join("\n")
  return Response.json({ ok: true, summary })
}

async function saveSignup(s: Signup, d: GroupDeparture) {
  const db = serviceDb()
  if (!db) return
  const ins = await db.from("group_signups").insert({
    departure_id: d.id,
    departure_label: label(d),
    people: s.people,
    name: s.name,
    contact_channel: s.contactChannel,
    contact: s.contact,
    comment: s.comment || null,
  })
  if (ins.error && !isMissingTable(ins.error)) console.error("group-signup: insert failed:", ins.error.message)

  // Лид в CRM Виктора, напоминание за 3 дня до выезда (Виктор 11.11: «за 3 дня, не раньше»)
  const today = todayInVietnam()
  const remind = new Date(Date.parse(`${d.date}T00:00:00Z`) - 3 * 86400_000).toISOString().slice(0, 10)
  const crm = await db.from("crm_clients").insert({
    name: s.name,
    channel: s.contactChannel,
    contact: s.contact,
    status: "new",
    date_from: d.date,
    people: s.people,
    tour: `Группа: ${d.tourTitle}`,
    price_usd: d.priceUsd !== null ? d.priceUsd * s.people : null,
    note: [`Запись в группу с сайта #${d.num}`, `${label(d)}`, d.guideName && `гид ${d.guideName}`, s.comment && `комментарий: ${s.comment}`]
      .filter(Boolean)
      .join("; "),
    remind_on: remind > today ? remind : today,
  })
  if (crm.error) console.error("group-signup: crm insert failed:", crm.error.message)
}

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { findZone, ftDateRu, quote, type FtBooking } from "@/lib/fasttrack"

// Серверная часть фаст-трека: сообщение Виктору одним блоком, лид в CRM (crm_clients),
// подпись ссылки для загрузки файлов. Паспорта и ваучеры на сайте не храним: каждый файл
// сразу уходит Виктору в Telegram ответом на сообщение заявки.

function key(): string | null {
  return (
    process.env.PARK_CONFIRM_SECRET ||
    process.env.TELEGRAM_ADMIN_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null
  )
}

const sign = (body: string, k: string) => createHmac("sha256", `ft:${k}`).update(body).digest("base64url").slice(0, 22)

export type UploadTokenData = { ref: string; name: string; messageId: number | null }

/** Токен на загрузку файлов к одной заявке, живёт 2 часа */
export function createUploadToken(d: UploadTokenData): string | null {
  const k = key()
  if (!k) return null
  const body = Buffer.from(JSON.stringify({ r: d.ref, n: d.name.slice(0, 40), m: d.messageId, e: Date.now() + 2 * 3600_000 })).toString(
    "base64url",
  )
  return `${body}.${sign(body, k)}`
}

export function readUploadToken(token: string): UploadTokenData | null {
  const k = key()
  const [body, sig] = token.split(".")
  if (!k || !body || !sig) return null
  const a = Buffer.from(sig)
  const b = Buffer.from(sign(body, k))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const d = JSON.parse(Buffer.from(body, "base64url").toString()) as { r: string; n: string; m: number | null; e: number }
    return d.e > Date.now() ? { ref: d.r, name: d.n, messageId: typeof d.m === "number" ? d.m : null } : null
  } catch {
    return null
  }
}

export const newRef = () => `FT-${randomBytes(3).toString("hex").toUpperCase()}`

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const enDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(`${iso}T00:00:00Z`),
  )

function priceLines(b: FtBooking): string[] {
  const q = quote(b.people, b.transfer, b.zone, b.pay)
  const zone = findZone(b.zone)
  return [
    `🧾 Фаст-трек ${b.people} × $32 = $${q.fasttrackUsd}`,
    ...(b.transfer
      ? [q.carUsd === null ? "🚐 Машина: большая группа, посчитать вручную" : `🚐 Машина до отеля (${zone?.label.toLowerCase()}): $${q.carUsd}`]
      : []),
    q.totalUsd !== null ? `💵 Итого: <b>$${q.totalUsd}</b>` : `💵 Итого: $${q.fasttrackUsd} + машина`,
    b.pay === "prepay"
      ? `💳 Предоплата <b>$${q.prepayUsd}</b> на рос. карту, на месте наличными ${q.cashUsd !== null ? `<b>$${q.cashUsd}</b>` : "остаток"}`
      : "💵 Без предоплаты: вся сумма наличными на месте (нет рос. карты)",
  ]
}

/** Сообщение Виктору: блок для агентства латиницей + цена и оплата по-русски */
export function fasttrackMessage(b: FtBooking, ref: string, files: { passports: number; vouchers: number }): string {
  const digits = b.whatsapp.replace(/\D/g, "")
  const lines = [
    `✈️ <b>FAST TRACK · Phu Quoc airport (PQC)</b> · ${ref}`,
    "",
    `🛬 Arrival: <b>${enDate(b.date)}, ${b.time}</b>`,
    `✈️ Flight: <b>${esc(b.flight)}</b>${b.fromCity ? ` from ${esc(b.fromCity)}` : ""}`,
    `👥 Passengers: <b>${b.people}</b>`,
    ...b.passengers.map((p, i) =>
      p.en || p.ru ? `${i + 1}. <b>${esc(p.en || "?")}</b>${p.ru ? ` (${esc(p.ru)})` : ""}` : `${i + 1}. по паспорту`,
    ),
    `🏨 Hotel: ${esc(b.hotel)}`,
    b.transfer ? `🚐 Transfer to hotel: <b>yes</b>${b.zone === "north" ? ", north" : ""}` : "🚐 Transfer: no (fast track only)",
    b.depDate || b.depFlight
      ? `🛫 Departure: ${b.depDate ? enDate(b.depDate) : "date ?"}${b.depTime ? `, ${b.depTime}` : ""}${b.depFlight ? `, ${esc(b.depFlight)}` : ""}`
      : "🛫 Departure: не знают",
    `📱 WhatsApp: <a href="https://wa.me/${digits}">${esc(b.whatsapp)}</a>`,
    "",
    ...priceLines(b),
    ...(b.comment ? ["", `💬 ${esc(b.comment)}`] : []),
    "",
    files.passports || files.vouchers
      ? `📎 Ответами придут: паспорта ${files.passports}, ваучер ${files.vouchers}`
      : "📎 Файлы не прикрепили, пришлют в WhatsApp",
  ]
  return lines.join("\n")
}

/** Текст для кнопки «Продублировать в WhatsApp» */
export function fasttrackSummaryRu(b: FtBooking, ref: string): string {
  const q = quote(b.people, b.transfer, b.zone, b.pay)
  return [
    `✈️ Заявка на фаст-трек ВикТур · ${ref}`,
    "",
    `👤 ${b.passengers[0].ru} (${b.passengers[0].en}), ${b.people} чел.`,
    `🛬 Прилёт: ${ftDateRu(b.date)}, ${b.time}, рейс ${b.flight}`,
    `🏨 ${b.hotel}${b.transfer ? ", с трансфером" : ", без трансфера"}`,
    q.totalUsd !== null ? `🧾 Итого: $${q.totalUsd}` : `🧾 Фаст-трек $${q.fasttrackUsd}, машину посчитаем`,
    b.pay === "prepay" ? `💳 Предоплата $${q.prepayUsd}, остальное наличными на месте` : "💵 Оплата на месте",
  ].join("\n")
}

/** Лид в CRM Виктора (crm_clients), напоминание за 3 дня до прилёта. true - записан. */
export async function saveFasttrackLead(b: FtBooking, ref: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) return false
  const q = quote(b.people, b.transfer, b.zone, b.pay)
  const zone = findZone(b.zone)
  const remind = new Date(Date.parse(`${b.date}T00:00:00Z`) - 3 * 86400_000).toISOString().slice(0, 10)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date())
  const lead = b.passengers[0]
  const db = createClient(url, sk, { auth: { persistSession: false } })
  const { error } = await db.from("crm_clients").insert({
    name: lead.ru || lead.en,
    channel: "whatsapp",
    contact: b.whatsapp,
    status: "new",
    date_from: b.date,
    date_to: /^\d{4}-\d{2}-\d{2}$/.test(b.depDate) ? b.depDate : null,
    people: b.people,
    tour: b.transfer ? `Фаст-трек + трансфер (${zone?.label ?? ""})` : "Фаст-трек",
    price_usd: q.totalUsd ?? q.fasttrackUsd,
    note:
      [
        `Заявка с сайта ${ref}`,
        `рейс ${b.flight} в ${b.time}${b.fromCity ? ` из ${b.fromCity}` : ""}`,
        `отель: ${b.hotel}`,
        b.depDate || b.depFlight ? `вылет: ${[b.depDate, b.depTime, b.depFlight].filter(Boolean).join(" ")}` : "",
        `пассажиры: ${b.passengers.map((p) => [p.en, p.ru && `(${p.ru})`].filter(Boolean).join(" ") || "по паспорту").join(", ")}`,
        b.pay === "prepay" ? `предоплата $${q.prepayUsd}, на месте ${q.cashUsd !== null ? `$${q.cashUsd}` : "остаток"}` : "оплата вся на месте",
        b.comment && `комментарий: ${b.comment}`,
        "паспорта/ваучер - в Telegram",
      ]
        .filter(Boolean)
        .join("; ") + `\nСтарший группы: ${lead.ru || lead.en}, ${b.whatsapp}`,
    remind_on: remind > today ? remind : today,
  })
  if (error) console.error("fasttrack: crm insert failed:", error.message)
  return !error
}

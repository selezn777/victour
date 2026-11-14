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

export type UploadTokenData = { ref: string; name: string; messageId: number | null; via: "admin" | "main" }

/** Токен на загрузку файлов к одной заявке, живёт 2 часа */
export function createUploadToken(d: UploadTokenData): string | null {
  const k = key()
  if (!k) return null
  const body = Buffer.from(JSON.stringify({ r: d.ref, n: d.name.slice(0, 40), m: d.messageId, v: d.via, e: Date.now() + 2 * 3600_000 })).toString(
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
    const d = JSON.parse(Buffer.from(body, "base64url").toString()) as { r: string; n: string; m: number | null; v?: string; e: number }
    return d.e > Date.now() ? { ref: d.r, name: d.n, messageId: typeof d.m === "number" ? d.m : null, via: d.v === "main" ? "main" : "admin" } : null
  } catch {
    return null
  }
}

export const newRef = () => `FT-${randomBytes(3).toString("hex").toUpperCase()}`

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const dmy = (iso: string) => iso.split("-").reverse().join(".")

/**
 * Сообщение Виктору в его формате (14.11): строки «поле - значение», имя по-русски - по-английски,
 * без эмодзи, чтобы переслать как есть. Паспорта и ваучер приходят ответами на это сообщение.
 * Дети у нас только до 10 лет, остальные взрослые (возраст видно по паспорту).
 */
export function fasttrackMessage(b: FtBooking, ref: string, files: { passports: number; vouchers: number }): string {
  const q = quote(b.people, b.kids, b.transfer, b.zone, b.pay)
  const zone = findZone(b.zone)
  const digits = b.whatsapp.replace(/\D/g, "")
  const named = b.passengers.filter((p) => p.ru || p.en)
  const name = (p: { ru: string; en: string }) => [p.ru, p.en].filter(Boolean).map(esc).join(" - ")
  const collect =
    q.totalUsd === null
      ? [`<b>Коллект - $${q.fasttrackUsd} + машина</b> (большая группа, посчитать)`]
      : b.pay === "prepay"
        ? [`Предоплата - $${q.prepayUsd} на рос. карту`, `<b>Коллект - $${q.cashUsd} наличными при встрече</b>`]
        : [`<b>Коллект - $${q.totalUsd} наличными при встрече</b> (без предоплаты)`]
  const lines = [
    `<b>${b.transfer ? "Фаст-трек + трансфер" : "Фаст-трек"}</b> · ${ref}`,
    "",
    `Прилёт - ${dmy(b.date)}, ${b.time}`,
    `Рейс - ${esc(b.flight)}${b.fromCity ? ` (${esc(b.fromCity)} - Фукуок)` : ""}`,
    `Пассажиров - ${b.people}${b.kids ? ` (из них детей до 10 лет - ${b.kids})` : ""}`,
    "",
    ...named.map((p, i) => `${i + 1}. ${name(p)}`),
    ...(b.people > named.length ? [`${b.people - named.length === 1 ? `${b.people}.` : `${named.length + 1}-${b.people}.`} по паспорту`] : []),
    "",
    b.transfer ? `Куда везти - ${esc(b.hotel)}${zone ? ` (${zone.label.toLowerCase()})` : ""}` : `Отель - ${esc(b.hotel)} (без трансфера)`,
    b.depDate || b.depFlight
      ? `Вылет - ${[b.depDate && dmy(b.depDate), b.depTime, b.depFlight && `рейс ${esc(b.depFlight)}`].filter(Boolean).join(", ")}`
      : "Вылет - не знают",
    `Телефон - <a href="https://wa.me/${digits}">${esc(b.whatsapp)}</a> (WhatsApp)`,
    "",
    `Фаст-трек ${b.kids ? `${b.people - b.kids} × $32 + ${b.kids} × $14` : `${b.people} × $32`} = $${q.fasttrackUsd}${b.transfer ? `, машина ${q.carUsd === null ? "вручную" : `$${q.carUsd}`}` : ""}${q.totalUsd !== null ? `, итого $${q.totalUsd}` : ""}`,
    ...collect,
    ...(b.comment ? ["", `Комментарий - ${esc(b.comment)}`] : []),
    "",
    files.passports || files.vouchers
      ? `Ответами придут: паспорта ${files.passports}, ваучер ${files.vouchers}`
      : "Файлы не прикрепили, пришлют в WhatsApp",
  ]
  return lines.join("\n")
}

/** Текст для кнопки «Продублировать в WhatsApp» */
export function fasttrackSummaryRu(b: FtBooking, ref: string): string {
  const q = quote(b.people, b.kids, b.transfer, b.zone, b.pay)
  return [
    `✈️ Заявка на фаст-трек ВикТур · ${ref}`,
    "",
    `👤 ${b.passengers[0].ru} (${b.passengers[0].en}), ${b.people} чел.`,
    `🛬 Прилёт: ${ftDateRu(b.date)}, ${b.time}, рейс ${b.flight}`,
    `🏨 ${b.hotel}${b.transfer ? ", с трансфером" : ", без трансфера"}`,
    q.totalUsd !== null ? `🧾 Итого: $${q.totalUsd}` : `🧾 Фаст-трек $${q.fasttrackUsd}, машину посчитаем`,
    b.pay === "prepay" ? (q.cashUsd === 0 ? `💳 Предоплата $${q.prepayUsd} - вся сумма` : `💳 Предоплата $${q.prepayUsd}, остальное наличными на месте`) : "💵 Оплата на месте",
  ].join("\n")
}

/** Лид в CRM Виктора (crm_clients), напоминание за 3 дня до прилёта. true - записан. */
export async function saveFasttrackLead(b: FtBooking, ref: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) return false
  const q = quote(b.people, b.kids, b.transfer, b.zone, b.pay)
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
        `рейс ${b.flight} в ${b.time}${b.fromCity ? `, откуда: ${b.fromCity}` : ""}`,
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

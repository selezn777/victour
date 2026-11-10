import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { transliterate } from "@/lib/park-booking-message"
import { findZone, ftDateRu, quote, type FtBooking } from "@/lib/fasttrack"

// Серверная часть фаст-трека: сообщение Виктору, запись в CRM, подпись ссылки
// для загрузки паспортов. Паспорта на сайте не храним: каждый файл сразу
// пересылается Виктору в Telegram и нигде не сохраняется.

function key(): string | null {
  return process.env.PARK_CONFIRM_SECRET || process.env.TELEGRAM_BOT_TOKEN || null
}

const sign = (body: string, k: string) => createHmac("sha256", `ft:${k}`).update(body).digest("base64url").slice(0, 22)

/** Токен на загрузку паспортов к одной заявке, живёт 2 часа */
export function createUploadToken(ref: string, name: string): string | null {
  const k = key()
  if (!k) return null
  const body = Buffer.from(JSON.stringify({ r: ref, n: name.slice(0, 40), e: Date.now() + 2 * 3600_000 })).toString("base64url")
  return `${body}.${sign(body, k)}`
}

export function readUploadToken(token: string): { ref: string; name: string } | null {
  const k = key()
  const [body, sig] = token.split(".")
  if (!k || !body || !sig) return null
  const a = Buffer.from(sig)
  const b = Buffer.from(sign(body, k))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const d = JSON.parse(Buffer.from(body, "base64url").toString()) as { r: string; n: string; e: number }
    return d.e > Date.now() ? { ref: d.r, name: d.n } : null
  } catch {
    return null
  }
}

export const newRef = () => `FT-${randomBytes(3).toString("hex").toUpperCase()}`

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const latin = (s: string) => (/[А-Яа-яЁё]/.test(s) ? `${esc(transliterate(s))} (${esc(s)})` : esc(s))

function contactLink(b: FtBooking): string {
  const digits = b.contact.replace(/\D/g, "")
  if (b.contactChannel === "whatsapp") return `WhatsApp <a href="https://wa.me/${digits}">${esc(b.contact)}</a>`
  const nick = b.contact.replace(/^@/, "")
  return /^[A-Za-z0-9_]{4,32}$/.test(nick) && /[A-Za-z_]/.test(nick)
    ? `Telegram <a href="https://t.me/${nick}">@${esc(nick)}</a>`
    : `Telegram ${esc(b.contact)}`
}

export function fasttrackMessage(b: FtBooking, ref: string): string {
  const q = quote(b.people, b.transfer, b.zone)
  const zone = findZone(b.zone)
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(`${b.date}T00:00:00Z`),
  )
  const lines = [
    `✈️ <b>NEW FAST TRACK — Phu Quoc airport</b> · ${ref}`,
    "",
    `📅 Arrival: <b>${date}</b>${b.time ? `, <b>${b.time}</b>` : ""}`,
    `🛬 Flight: <b>${esc(b.flight)}</b>`,
    `👥 Passengers: <b>${b.people}</b>`,
    b.transfer
      ? `🚐 Transfer to hotel: <b>yes</b> — ${esc(zone?.label ?? "")}`
      : "🚐 Transfer: no (fast track only)",
    ...(b.hotel ? [`🏨 Hotel: ${latin(b.hotel)}`] : []),
    `👤 Name: ${latin(b.name)}`,
    `📱 Contact: ${contactLink(b)}`,
    ...(b.comment ? [`💬 ${esc(b.comment)}`] : []),
    "",
    `🧾 <b>${b.people} чел.</b> · фаст-трек ${b.people} × $32 = $${q.fasttrackUsd}`,
    q.totalUsd !== null
      ? `💵 Итого: <b>$${q.totalUsd}</b>${b.transfer ? " (фаст-трек + машина до отеля)" : ""}`
      : `💵 Фаст-трек $${q.fasttrackUsd} + машина: ${q.transferNote}`,
    "📎 Паспорта придут следующими сообщениями (если турист их прикрепил)",
  ]
  return lines.join("\n")
}

export function fasttrackSummaryRu(b: FtBooking, ref: string): string {
  const q = quote(b.people, b.transfer, b.zone)
  const zone = findZone(b.zone)
  return [
    `✈️ Заявка на фаст-трек ВикТур · ${ref}`,
    "",
    `📅 Прилёт: ${ftDateRu(b.date)}${b.time ? `, ${b.time}` : ""}`,
    `🛬 Рейс: ${b.flight}`,
    `👥 ${b.people} чел.`,
    b.transfer ? `🚐 Трансфер до отеля: ${zone?.label ?? ""}${b.hotel ? `, ${b.hotel}` : ""}` : "🚐 Без трансфера",
    `👤 ${b.name}`,
    "",
    q.totalUsd !== null ? `🧾 Итого: $${q.totalUsd}` : `🧾 Фаст-трек $${q.fasttrackUsd}, машину посчитаем`,
  ].join("\n")
}

export async function sendTelegram(method: string, body: BodyInit, json = true): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: "POST",
      headers: json ? { "Content-Type": "application/json" } : undefined,
      body,
      signal: AbortSignal.timeout(20000),
    })
    const data = (await res.json()) as { ok: boolean; description?: string }
    if (!data.ok) console.error(`fasttrack: telegram ${method} failed:`, data.description)
    return data.ok
  } catch (err) {
    console.error(`fasttrack: telegram ${method} error:`, err)
    return false
  }
}

/** Лид в CRM Виктора (crm_clients), напоминание за неделю до прилёта */
export async function saveFasttrackLead(b: FtBooking, ref: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !sk) return
  const q = quote(b.people, b.transfer, b.zone)
  const zone = findZone(b.zone)
  const weekBefore = new Date(Date.parse(`${b.date}T00:00:00Z`) - 7 * 86400_000).toISOString().slice(0, 10)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date())
  const db = createClient(url, sk, { auth: { persistSession: false } })
  const { error } = await db.from("crm_clients").insert({
    name: b.name,
    channel: b.contactChannel,
    contact: b.contact,
    status: "new",
    date_from: b.date,
    people: b.people,
    tour: b.transfer ? `Фаст-трек + трансфер (${zone?.label ?? ""})` : "Фаст-трек",
    price_usd: q.totalUsd ?? q.fasttrackUsd,
    note: [
      `Заявка с сайта ${ref}`,
      `рейс ${b.flight}${b.time ? ` в ${b.time}` : ""}`,
      b.hotel && `отель: ${b.hotel}`,
      b.comment && `комментарий: ${b.comment}`,
      "паспорта - в Telegram",
    ]
      .filter(Boolean)
      .join("; ") + `
Старший группы: ${b.name}, ${b.contact}`,
    remind_on: weekBefore > today ? weekBefore : today,
  })
  if (error) console.error("fasttrack: crm insert failed:", error.message)
}

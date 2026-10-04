import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { DESTINATIONS, findSlot, type DestinationId, type ParkBooking } from "@/app/park/park-config"

// Подтверждение выезда без базы: всё, что нужно показать туристу и прислать
// Виктору, лежит в самой ссылке, подписанной HMAC — подделать или поменять
// данные нельзя. Ключ — PARK_CONFIRM_SECRET (или токен бота, если не задан).

export type ConfirmData = {
  dest: DestinationId
  date: string // YYYY-MM-DD
  boat: string | null // Хон Там: время катера
  cableCar?: string | null // парк: во сколько заходят на канатку (в старых ссылках нет)
  pickup: string | null // выезд от отеля
  name: string
  hotel: string
  contact: string
  pkg: string // id билета
  phone: string | null // E.164, если контакт — номер (для напоминания в WhatsApp)
}

function secret(): string | null {
  return process.env.PARK_CONFIRM_SECRET || process.env.TELEGRAM_BOT_TOKEN || null
}

function sign(body: string, key: string): string {
  return createHmac("sha256", key).update(body).digest("base64url").slice(0, 22)
}

export function confirmDataFromBooking(b: ParkBooking): ConfirmData {
  const slot = findSlot(b.destination, b.departureTime)
  return {
    dest: b.destination,
    date: b.date,
    boat: slot?.boat ?? null,
    cableCar: slot?.cableCar ?? null,
    pickup: slot?.pickup ?? null,
    name: b.name,
    hotel: b.hotel,
    contact: b.contact,
    pkg: b.packageId,
    phone: /^\+\d{7,15}$/.test(b.contact) ? b.contact : null,
  }
}

export function createConfirmToken(data: ConfirmData): string | null {
  const key = secret()
  if (!key) return null
  const body = Buffer.from(JSON.stringify(data)).toString("base64url")
  return `${body}.${sign(body, key)}`
}

export function readConfirmToken(token: string): ConfirmData | null {
  const key = secret()
  const [body, sig] = token.split(".")
  if (!key || !body || !sig) return null
  const expected = Buffer.from(sign(body, key))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as ConfirmData
    return DESTINATIONS[data.dest] ? data : null
  } catch {
    return null
  }
}

/**
 * Когда напомнить туристу: за час до выезда от отеля
 * (старые заявки парка без времени — в 7:00 утра в день поездки).
 * Возвращает момент в UTC (Нячанг = UTC+7, без перехода на летнее время).
 */
export function reminderAtUtc(data: ConfirmData): Date {
  const [h, m] = (data.pickup ?? "8:00").split(":").map(Number)
  const local = new Date(`${data.date}T00:00:00Z`)
  local.setUTCHours(h - 1, m)
  return new Date(local.getTime() - 7 * 60 * 60 * 1000)
}

export function confirmSummaryRu(data: ConfirmData): string {
  const dest = DESTINATIONS[data.dest]
  const pkg = dest.packages.find((p) => p.id === data.pkg)
  const date = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date(`${data.date}T00:00:00Z`))
  const place = data.dest === "hontam" ? "Остров Хон Там" : "VinWonders"
  return [place, pkg?.title, date].filter(Boolean).join(" · ")
}

// ---------- Короткие ссылки: /c/<id> ----------
// Длинный токен лежит файлом в приватном bucket Supabase Storage, в ссылке —
// только случайный id. Не получилось сохранить — отдаём длинную ссылку.

const LINKS_BUCKET = "park-links"
const SHORT_ID = /^[A-Za-z0-9]{7}$/

function storage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } }).storage.from(LINKS_BUCKET)
}

function randomId(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  return Array.from(randomBytes(7), (b) => abc[b % abc.length]).join("")
}

/** Сохраняет токен и возвращает короткий id, или null, если хранилище недоступно. */
export async function createShortId(token: string): Promise<string | null> {
  const bucket = storage()
  if (!bucket) return null
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = randomId()
    const { error } = await bucket.upload(id, token, { contentType: "text/plain", upsert: false })
    if (!error) return id
  }
  console.error("park-confirm: short link upload failed")
  return null
}

/** Параметр ссылки (короткий id или сам токен) → длинный токен. */
export async function resolveLinkParam(param: string): Promise<string | null> {
  const value = decodeURIComponent(param)
  if (!SHORT_ID.test(value)) return value
  const { data } = (await storage()?.download(value)) ?? {}
  return data ? (await data.text()).trim() : null
}

import { createHmac, timingSafeEqual } from "node:crypto"
import { DESTINATIONS, type DestinationId, type ParkBooking } from "@/app/park/park-config"

// Подтверждение выезда без базы: всё, что нужно показать туристу и прислать
// Виктору, лежит в самой ссылке, подписанной HMAC — подделать или поменять
// данные нельзя. Ключ — PARK_CONFIRM_SECRET (или токен бота, если не задан).

export type ConfirmData = {
  dest: DestinationId
  date: string // YYYY-MM-DD
  boat: string | null // Хон Там: время катера
  pickup: string | null // Хон Там: выезд от отеля
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
  const slot = DESTINATIONS[b.destination].departureTimes?.find((t) => t.boat === b.departureTime)
  return {
    dest: b.destination,
    date: b.date,
    boat: slot?.boat ?? null,
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
 * Когда напомнить туристу: Хон Там — за час до выезда от отеля,
 * парк (время выезда согласуем отдельно) — в 7:00 утра в день поездки.
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

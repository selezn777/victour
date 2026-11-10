// Фаст-трек в аэропорту Фукуока (Виктор 2026-11-10): продаём фаст-трек,
// трансфер до отеля идёт бонусом. Цены - сетка Виктора:
// только фаст-трек $32/чел; фаст-трек + машина до отеля 1 - $55, 2 - $85, 3 - $115,
// 4 - $145, 5 - $175 (каждый следующий +$30); дальний север (Бай Дай, Гань Дау) +$20.

export const FT_PRICE_USD = 32
/** Больше - машину и цену подбираем вручную */
export const FT_MAX_TRANSFER_PEOPLE = 7
export const FT_MAX_PEOPLE = 20
export const FT_MAX_PASSPORTS = 20

export type FtZone = { id: string; label: string; note: string; extraUsd: number }

export const FT_ZONES: FtZone[] = [
  { id: "center", label: "Зыонг Донг, Онг Ланг", note: "центр и запад острова", extraUsd: 0 },
  { id: "long_beach", label: "Лонг Бич", note: "Бай Чыонг, Sonasea", extraUsd: 0 },
  { id: "south", label: "Юг: Ан Тхой, Sunset Town", note: "Бай Кем, Бай Сао", extraUsd: 0 },
  { id: "north", label: "Север: Бай Дай, Гань Дау", note: "Grand World, Vinpearl, Wyndham Grand", extraUsd: 20 },
]

export const findZone = (id: string | null | undefined) => FT_ZONES.find((z) => z.id === id)

/** Цена «фаст-трек + машина до отеля» за всю группу, null - считаем вручную */
export function comboUsd(people: number, zone: FtZone | undefined): number | null {
  if (people < 1 || people > FT_MAX_TRANSFER_PEOPLE) return null
  return 55 + 30 * (people - 1) + (zone?.extraUsd ?? 0)
}

export type FtQuote = { fasttrackUsd: number; totalUsd: number | null; transferNote: string | null }

export function quote(people: number, transfer: boolean, zoneId: string | null): FtQuote {
  const fasttrackUsd = people * FT_PRICE_USD
  if (!transfer) return { fasttrackUsd, totalUsd: fasttrackUsd, transferNote: null }
  const combo = comboUsd(people, findZone(zoneId))
  if (combo === null) return { fasttrackUsd, totalUsd: null, transferNote: "машину на большую группу посчитаем в WhatsApp" }
  return { fasttrackUsd, totalUsd: combo, transferNote: null }
}

export type FtBooking = {
  date: string // YYYY-MM-DD
  flight: string
  time: string // HH:MM или ""
  people: number
  transfer: boolean
  zone: string | null
  hotel: string
  name: string
  contactChannel: "whatsapp" | "telegram"
  contact: string
  comment: string
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

export function validateFtBooking(
  input: Record<string, unknown>,
): { ok: true; data: FtBooking } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const date = str(input.date, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Укажите дату прилёта"
  const flight = str(input.flight, 20).toUpperCase()
  if (!/^[A-Z0-9]{2}\s?\d{1,5}[A-Z]?$/.test(flight)) errors.flight = "Номер рейса, например VJ 975"
  const time = str(input.time, 5)
  if (time && !/^\d{2}:\d{2}$/.test(time)) errors.time = "Время в формате 14:30"
  const people = Number(input.people)
  if (!Number.isInteger(people) || people < 1 || people > FT_MAX_PEOPLE) errors.people = "Сколько человек?"
  const transfer = input.transfer === true
  const zone = transfer ? str(input.zone, 20) || null : null
  if (transfer && !findZone(zone)) errors.zone = "Выберите район отеля"
  const hotel = str(input.hotel, 160)
  if (transfer && !hotel) errors.hotel = "Укажите отель"
  const name = str(input.name, 80)
  if (!name) errors.name = "Как к вам обращаться?"
  const contactChannel = input.contactChannel === "telegram" ? "telegram" : "whatsapp"
  const contact = str(input.contact, 40)
  if (contactChannel === "whatsapp" && contact.replace(/\D/g, "").length < 8) errors.contact = "Номер WhatsApp с кодом страны"
  if (contactChannel === "telegram" && contact.replace(/^@/, "").length < 4) errors.contact = "Ник или номер в Telegram"
  const comment = str(input.comment, 600)
  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, data: { date, flight, time, people, transfer, zone, hotel, name, contactChannel, contact, comment } }
}

export function ftDateRu(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", weekday: "short", day: "numeric", month: "long" }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

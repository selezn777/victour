// Фаст-трек в аэропорту Фукуока. Правила Виктора (2026-11-14):
// - фаст-трек $32 с человека;
// - трансфер до отеля по себестоимости, за машину: $12 по всему острову (центр, Sunset Town и т.д.),
//   $18 только для северных отелей (Vinpearl, Wyndham Grand, Grand World и рядом);
// - предоплата $20 на российскую карту, остаток наличными при встрече.
//   Казахам и другим иностранцам предоплату брать неудобно - вариант «всё на месте».
// Заявку заполняют пошаговым мастером (src/app/fasttrack/fasttrack-wizard.tsx), шаги и
// проверка полей общие для браузера и сервера.

export const FT_PRICE_USD = 32
export const FT_PREPAY_USD = 20
export const FT_MAX_PEOPLE = 20
/** Больше - машину (минивэн) и цену подбираем вручную */
export const FT_CAR_MAX_PEOPLE = 7
export const FT_MAX_PASSPORTS = 20
export const FT_MAX_VOUCHERS = 4
export const FT_MAX_FILE_BYTES = 4 * 1024 * 1024
export const FT_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

export type FtZone = { id: string; label: string; note: string; carUsd: number }

export const FT_ZONES: FtZone[] = [
  { id: "island", label: "Весь остров", note: "центр, Зыонг Донг, Онг Ланг, Лонг Бич, юг, Sunset Town", carUsd: 12 },
  { id: "north", label: "Северные отели", note: "Vinpearl, VinOasis, Grand World, Wyndham Grand", carUsd: 18 },
]

export const findZone = (id: string | null | undefined) => FT_ZONES.find((z) => z.id === id)

/** Подсказка зоны по названию отеля: северные отели узнаём по имени */
const NORTH_HOTEL = /vin\s?pearl|vin\s?oasis|vin\s?wonders|wonder\s?world|grand\s?world|wyndham|radisson|bai\s?dai|ganh\s?dau|винп[её]рл|виноазис|винвандерс|гранд\s?ворлд|виндх[еэ]м|радиссон|бай\s?дай|гань\s?дау/i
export const guessZone = (hotel: string): string | null => (hotel.trim().length < 3 ? null : NORTH_HOTEL.test(hotel) ? "north" : "island")

export type FtPay = "prepay" | "on_site"

export type FtQuote = {
  fasttrackUsd: number
  /** null - машину на большую группу считаем вручную */
  carUsd: number | null
  totalUsd: number | null
  prepayUsd: number
  /** Остаток наличными при встрече, null если итог считаем вручную */
  cashUsd: number | null
}

export function quote(people: number, transfer: boolean, zoneId: string | null, pay: FtPay): FtQuote {
  const fasttrackUsd = people * FT_PRICE_USD
  const zone = findZone(zoneId)
  const carUsd = !transfer ? 0 : people > FT_CAR_MAX_PEOPLE ? null : (zone?.carUsd ?? FT_ZONES[0].carUsd)
  const totalUsd = carUsd === null ? null : fasttrackUsd + carUsd
  const prepayUsd = pay === "prepay" ? FT_PREPAY_USD : 0
  return { fasttrackUsd, carUsd, totalUsd, prepayUsd, cashUsd: totalUsd === null ? null : totalUsd - prepayUsd }
}

// Латиница как в загранпаспорте РФ (ICAO 9303): подсказка, турист может поправить.
const ICAO: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i", к: "k",
  л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "ie", ы: "y", ь: "", э: "e", ю: "iu", я: "ia",
}
export function toPassportLatin(s: string): string {
  // казахские и прочие буквы без пары в ICAO-таблице: не угадываем, пусть впишут сами
  if (/[^\sа-яёa-z'-]/i.test(s)) return ""
  return Array.from(s.toLowerCase())
    .map((ch) => ICAO[ch] ?? ch)
    .join("")
    .toUpperCase()
    .replace(/[^A-Z\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export type FtPassenger = { ru: string; en: string }

export type FtBooking = {
  passengers: FtPassenger[] // [0] - тот, кто заполняет
  whatsapp: string
  people: number
  date: string // YYYY-MM-DD
  time: string // HH:MM
  flight: string
  fromCity: string
  transfer: boolean
  zone: string | null
  hotel: string
  depDate: string // "" если не знают
  depTime: string
  depFlight: string
  pay: FtPay
  comment: string
}

export const FT_STEPS = [
  { id: "who", title: "Кто летит" },
  { id: "arrival", title: "Прилёт" },
  { id: "hotel", title: "Отель и вылет" },
  { id: "docs", title: "Документы" },
  { id: "check", title: "Проверка и оплата" },
] as const
export type FtStepId = (typeof FT_STEPS)[number]["id"]

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const LATIN_NAME = /^[A-Za-z][A-Za-z\s'-]*$/

/** Приводит сырой ввод к FtBooking (без проверки) */
export function normalizeFt(input: Record<string, unknown>): FtBooking {
  const people = Math.max(1, Math.min(FT_MAX_PEOPLE, Math.trunc(Number(input.people)) || 1))
  const rawPassengers = Array.isArray(input.passengers) ? (input.passengers as unknown[]) : []
  const passengers: FtPassenger[] = Array.from({ length: people }, (_, i) => {
    const p = (rawPassengers[i] ?? {}) as Record<string, unknown>
    return { ru: str(p.ru, 80), en: str(p.en, 80).toUpperCase() }
  })
  const transfer = input.transfer !== false
  return {
    passengers,
    whatsapp: str(input.whatsapp, 30),
    people,
    date: str(input.date, 10),
    time: str(input.time, 5),
    flight: str(input.flight, 12).toUpperCase(),
    fromCity: str(input.fromCity, 60),
    transfer,
    zone: transfer ? str(input.zone, 12) || null : null,
    hotel: str(input.hotel, 160),
    depDate: str(input.depDate, 10),
    depTime: str(input.depTime, 5),
    depFlight: str(input.depFlight, 12).toUpperCase(),
    pay: input.pay === "on_site" ? "on_site" : "prepay",
    comment: str(input.comment, 600),
  }
}

/** Ошибки одного шага: ключ - id поля в форме */
export function validateFtStep(step: FtStepId, b: FtBooking, today?: string): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === "who") {
    const lead = b.passengers[0]
    if (!lead?.ru) e["p0-ru"] = "Имя и фамилия"
    if (!lead?.en || !LATIN_NAME.test(lead.en)) e["p0-en"] = "Латиницей, как в загранпаспорте"
    b.passengers.slice(1).forEach((p, i) => {
      if (p.en && !LATIN_NAME.test(p.en)) e[`p${i + 1}-en`] = "Только латиница"
    })
    if (b.whatsapp.replace(/\D/g, "").length < 8) e.whatsapp = "Номер WhatsApp с кодом страны"
  }
  if (step === "arrival") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date)) e.date = "Дата прилёта"
    else if (today && b.date < today) e.date = "Дата уже прошла"
    if (!/^\d{2}:\d{2}$/.test(b.time)) e.time = "Время прилёта по билету"
    if (!/^[A-Z0-9]{2}\s?\d{1,5}[A-Z]?$/.test(b.flight)) e.flight = "Номер рейса, например VJ 975"
    if (!b.fromCity) e.fromCity = "Откуда летите"
  }
  if (step === "hotel") {
    if (!b.hotel) e.hotel = "Название отеля"
    if (b.transfer && !findZone(b.zone)) e.zone = "Выберите район"
    if (b.depDate && !/^\d{4}-\d{2}-\d{2}$/.test(b.depDate)) e.depDate = "Дата вылета"
    else if (b.depDate && /^\d{4}-\d{2}-\d{2}$/.test(b.date) && b.depDate < b.date) e.depDate = "Вылет раньше прилёта"
    if (b.depTime && !/^\d{2}:\d{2}$/.test(b.depTime)) e.depTime = "Время в формате 10:30"
    if (b.depFlight && !/^[A-Z0-9]{2}\s?\d{1,5}[A-Z]?$/.test(b.depFlight)) e.depFlight = "Например VJ 976"
  }
  return e
}

export function validateFtBooking(
  input: Record<string, unknown>,
): { ok: true; data: FtBooking } | { ok: false; errors: Record<string, string>; step: FtStepId } {
  const b = normalizeFt(input)
  for (const s of FT_STEPS) {
    const errors = validateFtStep(s.id, b)
    if (Object.keys(errors).length) return { ok: false, errors, step: s.id }
  }
  return { ok: true, data: b }
}

export function ftDateRu(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", weekday: "short", day: "numeric", month: "long" }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

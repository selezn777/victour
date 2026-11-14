// Фаст-трек в аэропорту Фукуока. Правила Виктора (2026-11-14):
// - фаст-трек $32 со взрослого, дети до 10 лет $14 (с 10 лет - взрослый);
// - трансфер до отеля по себестоимости, за машину: $12 по всему острову (центр, Sunset Town и т.д.),
//   $18 только для северных отелей (Vinpearl, Wyndham Grand, Grand World и рядом);
// - предоплата докругляет остаток до кратного $50 (одна купюра на месте): $120 -> $20, $130 -> $30, $82 -> $32;
//   оплата по СБП на Т-Банк (Виктор С.) или по QR, реквизиты показываем после отправки заявки.
//   Казахам и другим иностранцам предоплату брать неудобно - вариант «всё на месте».
// Заявку заполняют пошаговым мастером (src/app/fasttrack/fasttrack-wizard.tsx), шаги и
// проверка полей общие для браузера и сервера.

export const FT_PRICE_USD = 32
/** Ребёнок до 10 лет (Виктор 14.11), с 10 лет считаем взрослым */
export const FT_CHILD_PRICE_USD = 14
/** СБП для предоплаты (Виктор 14.11) */
export const FT_SBP = { phone: "+7 902 865-11-13", bank: "Т-Банк", name: "Виктор С." }
/** Предоплата: столько, чтобы на месте осталась сумма, кратная $50 (одна купюра) */
export function ftPrepay(total: number): number {
  const r = total % 50
  if (r > 0) return r
  return total > 50 ? 50 : total
}
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

export function quote(people: number, kids: number, transfer: boolean, zoneId: string | null, pay: FtPay): FtQuote {
  const k = Math.max(0, Math.min(people - 1, kids))
  const fasttrackUsd = (people - k) * FT_PRICE_USD + k * FT_CHILD_PRICE_USD
  const zone = findZone(zoneId)
  const carUsd = !transfer ? 0 : people > FT_CAR_MAX_PEOPLE ? null : (zone?.carUsd ?? FT_ZONES[0].carUsd)
  const totalUsd = carUsd === null ? null : fasttrackUsd + carUsd
  const prepayUsd = pay === "prepay" ? ftPrepay(totalUsd ?? fasttrackUsd) : 0
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
  /** из них детей до 10 лет */
  kids: number
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
  { id: "docs", title: "Паспорта" },
  { id: "arrival", title: "Прилёт" },
  { id: "hotel", title: "Отель и вылет" },
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
    kids: Math.max(0, Math.min(people - 1, Math.trunc(Number(input.kids)) || 0)),
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

/** Номер телефона с пробелами по мере ввода: +7 999 123-45-67, остальные страны группами */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 15)
  if (!digits) return raw.trim().startsWith("+") ? "+" : ""
  if (digits[0] === "7" || digits[0] === "8") {
    const d = "7" + digits.slice(1, 11)
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
    let s = "+7"
    if (p[0]) s += " " + p[0]
    if (p[1]) s += " " + p[1]
    if (p[2]) s += "-" + p[2]
    if (p[3]) s += "-" + p[3]
    return s
  }
  const cc = digits.length > 3 ? digits.slice(0, digits.length > 11 ? 3 : 2) : digits
  const rest = digits.slice(cc.length).match(/.{1,3}/g) ?? []
  return ["+" + cc, ...rest].join(" ")
}

export function ftDateRu(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", weekday: "short", day: "numeric", month: "long" }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

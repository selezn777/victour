// Разбор расписания, которое Виктор кидает групповому боту одним сообщением, построчно:
//   20.11 Юг 2.0 9:00 гид Виктор 8 мест $60
//   22.11 Острова 7:30 10 мест 45$ занято 3
// Строка начинается с даты (ДД.ММ или ДД.ММ.ГГГГ), дальше в любом порядке: время, «гид Имя»,
// «N мест», цена ($60, 60$, 60 usd), «занято N». Что осталось - название тура.
// Чистые функции без базы: проверяются отдельно, используются в /api/group-bot.

export const GROUP_TIMEZONE = "Asia/Ho_Chi_Minh"

export type ParsedDeparture = {
  date: string // YYYY-MM-DD
  time: string | null // HH:MM
  tourTitle: string
  guideName: string | null
  seatsTotal: number
  seatsBooked: number
  priceUsd: number | null
}

export type ParseResult = { ok: true; value: ParsedDeparture } | { ok: false; error: string }

/** Сегодня по времени Вьетнама, YYYY-MM-DD */
export function todayInVietnam(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: GROUP_TIMEZONE }).format(now)
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function isRealDate(y: number, m: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

/** ДД.ММ без года - ближайшая такая дата не раньше сегодняшней (в декабре 05.01 - это январь следующего года). */
export function resolveDate(day: number, month: number, year: number | null, today: string): string | null {
  const [ty] = today.split("-").map(Number)
  if (year !== null) {
    const y = year < 100 ? 2000 + year : year
    return isRealDate(y, month, day) ? `${y}-${pad(month)}-${pad(day)}` : null
  }
  if (isRealDate(ty, month, day)) {
    const iso = `${ty}-${pad(month)}-${pad(day)}`
    if (iso >= today) return iso
    // Недавно прошедшая дата - скорее опечатка, а не следующий год
    const daysAgo = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / 86400_000
    if (daysAgo <= 60) return null
  }
  return isRealDate(ty + 1, month, day) ? `${ty + 1}-${pad(month)}-${pad(day)}` : null
}

export function parseScheduleLine(raw: string, today: string): ParseResult {
  let s = ` ${raw.replace(/[—–]/g, "-").replace(/\s+/g, " ").trim()} `

  const dm = s.match(/^ (\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?(?=[\s,])/)
  if (!dm) return { ok: false, error: "строка должна начинаться с даты, например 20.11" }
  const date = resolveDate(Number(dm[1]), Number(dm[2]), dm[3] ? Number(dm[3]) : null, today)
  if (!date) return { ok: false, error: `не понял дату «${dm[0].trim()}» или она уже прошла` }
  s = s.slice(dm[0].length)

  const take = (re: RegExp): RegExpMatchArray | null => {
    const m = s.match(re)
    if (m) s = s.replace(m[0], " ")
    return m
  }

  // Цена раньше времени и мест: «$60» / «60$» / «60 usd» / «60 долл»
  const pm = take(/\$\s?(\d{1,4})(?:[.,]\d+)?|(\d{1,4})\s?(?:\$|usd\b|долл\S*)/i)
  const priceUsd = pm ? Number(pm[1] ?? pm[2]) : null

  const bm = take(/(?:занято|записано|записалось|продано)\s?(\d{1,2})/i)
  const seatsBooked = bm ? Number(bm[1]) : 0

  const sm = take(/(\d{1,2})\s?(?:мест[ао]?|чел\S*|pax)(?=[\s,.]|$)/i) ?? take(/мест[ао]?:?\s?(\d{1,2})/i)
  if (!sm) return { ok: false, error: "не нашёл, сколько мест: напишите например «8 мест»" }
  const seatsTotal = Number(sm[1])
  if (seatsTotal < 1) return { ok: false, error: "мест должно быть хотя бы 1" }
  if (seatsBooked > seatsTotal) return { ok: false, error: `занято ${seatsBooked} больше, чем мест (${seatsTotal})` }

  const tm = take(/(?<![\d.])([01]?\d|2[0-3])[:.]([0-5]\d)(?![\d.])/)
  const time = tm ? `${pad(Number(tm[1]))}:${tm[2]}` : null

  const gm = take(/гид[:\s]+([\p{L}][\p{L}-]*)/iu)
  const guideName = gm ? gm[1][0].toUpperCase() + gm[1].slice(1) : null

  const tourTitle = s
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:-]+|[\s,;:-]+$/g, "")
    .trim()
  if (!tourTitle) return { ok: false, error: "не нашёл название тура" }

  return { ok: true, value: { date, time, tourTitle, guideName, seatsTotal, seatsBooked, priceUsd } }
}

/** Делит сообщение на непустые строки расписания. */
export function splitScheduleLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]
const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]

/** «20 ноября, чт» */
export function formatDateRu(iso: string, withWeekday = true): string {
  const [y, m, d] = iso.split("-").map(Number)
  const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${d} ${MONTHS[m - 1]}${withWeekday ? `, ${wd}` : ""}`
}

/** «20.11» */
export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${d}.${m}`
}

import { parsePhoneNumberFromString } from "libphonenumber-js/min"
import {
  CONTACT_CHANNELS,
  DESTINATIONS,
  PARK_TIMEZONE,
  type ParkBooking,
} from "@/app/park/park-config"
import type { ConfirmData } from "@/lib/park-confirm"

// Заявка с /park уходит Виктору в Telegram на английском: всё, что выбрано
// из списков, — по словарю; имя и отель — транслитом (оригинал в скобках);
// комментарий — через DeepL, если задан DEEPL_API_KEY.

const CYRILLIC = /[А-Яа-яЁёІіЇїЄєҐґ]/

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya", і: "i", ї: "yi", є: "ye", ґ: "g",
}

export function transliterate(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const lower = ch.toLowerCase()
      const t = TRANSLIT[lower]
      if (t === undefined) return ch
      if (ch === lower || t === "") return t
      return t.charAt(0).toUpperCase() + t.slice(1)
    })
    .join("")
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** "Ivan Petrov (Иван Петров)" для кириллицы, иначе как есть. */
function latinWithOriginal(text: string): string {
  if (!CYRILLIC.test(text)) return escapeHtml(text)
  return `${escapeHtml(transliterate(text))} (${escapeHtml(text)})`
}

function formatTripDate(isoDate: string): string {
  // "Sat, 03 Oct 2026" — дата без времени, считаем в UTC, чтобы не съехала
  const d = new Date(`${isoDate}T00:00:00Z`)
  const part = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(d)
  return `${part({ weekday: "short" })}, ${part({ day: "2-digit" })} ${part({ month: "short" })} ${part({ year: "numeric" })}`
}

function formatSentAt(now: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: PARK_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} (Nha Trang time)`
}

function formatContact(booking: ParkBooking): string {
  const label = CONTACT_CHANNELS[booking.contactChannel].english
  const digits = booking.contact.replace(/\D/g, "")
  // номер приходит в E.164 (+79991234567) — показываем с пробелами для читаемости
  const phone = parsePhoneNumberFromString(booking.contact)
  const value = phone?.isValid() ? phone.formatInternational() : booking.contact

  if (booking.contactChannel === "whatsapp") {
    return `${label} <a href="https://wa.me/${digits}">${escapeHtml(value)}</a>`
  }
  if (booking.contactChannel === "telegram") {
    const username = value.replace(/^@/, "")
    if (/^[A-Za-z0-9_]{4,32}$/.test(username) && /[A-Za-z_]/.test(username)) {
      return `${label} <a href="https://t.me/${username}">@${escapeHtml(username)}</a>`
    }
    return `${label} <a href="https://t.me/+${digits}">${escapeHtml(value)}</a>`
  }
  return `${label} ${escapeHtml(value)}`
}

async function translateComment(comment: string): Promise<string> {
  if (!CYRILLIC.test(comment)) return escapeHtml(comment)

  const key = process.env.DEEPL_API_KEY
  if (key) {
    try {
      const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com"
      const res = await fetch(`https://${host}/v2/translate`, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: [comment], target_lang: "EN-US" }),
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data = (await res.json()) as { translations?: { text: string }[] }
        const translated = data.translations?.[0]?.text
        if (translated) return escapeHtml(translated)
      } else {
        console.error("park-booking: DeepL error", res.status, await res.text())
      }
    } catch (err) {
      console.error("park-booking: DeepL failed", err)
    }
  }
  return `${escapeHtml(comment)} <i>(original, RU)</i>`
}

function formatHotel(booking: ParkBooking): string[] {
  const place = booking.hotelPlace
  if (!place) return [`🏨 Hotel: ${latinWithOriginal(booking.hotel)}`]
  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}` +
    `&query_place_id=${encodeURIComponent(place.placeId)}`
  const lines = [`🏨 Hotel: <a href="${escapeHtml(mapsUrl)}">${latinWithOriginal(booking.hotel)}</a> (Google Maps)`]
  if (place.address) lines.push(`📍 ${latinWithOriginal(place.address)}`)
  return lines
}

export async function buildParkBookingMessage(
  booking: ParkBooking,
  confirmUrl: string | null,
  now = new Date(),
) {
  const dest = DESTINATIONS[booking.destination]
  const pkg = dest.packages.find((p) => p.id === booking.packageId)!

  const lines = [
    `${booking.destination === "hontam" ? "🏝" : "🎟"} <b>NEW BOOKING — ${dest.english}</b>`,
    "",
    `📅 Date: <b>${formatTripDate(booking.date)}</b>`,
  ]
  const slot = dest.departureTimes?.find((t) => t.boat === booking.departureTime)
  if (slot) {
    lines.push(`🚤 Boat: <b>${slot.boat}</b> — hotel pick-up <b>${slot.pickup}</b> (±10 min)`)
  }
  lines.push(
    `🎫 Package: ${pkg.english}`,
    "",
    "👥 Guests:",
    ...dest.guests.map((g) => `• ${g.english}: ${booking.guests[g.key] ?? 0}`),
    "",
    ...formatHotel(booking),
    `👤 Name: ${latinWithOriginal(booking.name)}`,
    `📱 Contact: ${formatContact(booking)}`,
  )
  const extras = dest.extras.filter((e) => booking.extras[e.key])
  lines.push("", extras.length > 0 ? "➕ Extras (per person):" : "➕ Extras: none")
  for (const e of extras) lines.push(`• ${e.english} × <b>${booking.extras[e.key]}</b>`)
  if (booking.comment) lines.push(`💬 Comment: ${await translateComment(booking.comment)}`)
  lines.push(`🕒 Sent: ${formatSentAt(now)}`)
  if (confirmUrl) {
    lines.push("", `🔗 Guest's pick-up confirmation link: ${escapeHtml(confirmUrl)}`)
  }
  // Напоминание туристу по-русски — открывается в WhatsApp Виктора одним тапом
  // (короткая ссылка на наш редирект, текст собирается из подписанного токена)
  const guestPhone = parsePhoneNumberFromString(booking.contact)
  if (confirmUrl && guestPhone?.isValid()) {
    const remindUrl = confirmUrl.replace("/park/confirm/", "/park/remind/")
    lines.push(`📲 <a href="${escapeHtml(remindUrl)}">Send guest the RU reminder via WhatsApp</a>`)
  }
  return lines.join("\n")
}

export function buildParkConfirmedMessage(data: ConfirmData, now = new Date()): string {
  const dest = DESTINATIONS[data.dest]
  const pkg = dest.packages.find((p) => p.id === data.pkg)
  const phone = parsePhoneNumberFromString(data.contact)
  const contact = phone?.isValid()
    ? `<a href="https://wa.me/${data.contact.replace(/\D/g, "")}">${escapeHtml(phone.formatInternational())}</a>`
    : escapeHtml(data.contact)
  const lines = [
    `✅ <b>PICK-UP CONFIRMED — ${dest.english}</b>`,
    "",
    `👤 ${latinWithOriginal(data.name)}`,
    `📅 ${formatTripDate(data.date)}${pkg ? ` · ${escapeHtml(pkg.english.split(" (")[0])}` : ""}`,
  ]
  if (data.boat) lines.push(`🚤 Boat ${data.boat} — hotel pick-up ${data.pickup} (±10 min)`)
  lines.push(
    `🏨 ${latinWithOriginal(data.hotel)}`,
    `📱 ${contact}`,
    `🕒 Confirmed: ${formatSentAt(now)}`,
  )
  return lines.join("\n")
}

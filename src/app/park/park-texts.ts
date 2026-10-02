import { DESTINATIONS, findSlot, type DestinationId, type ParkBooking } from "./park-config"

const ruDate = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date(`${iso}T00:00:00Z`))

// Заявка по-русски: турист отправляет её себе в чат с Виктором (экран успеха),
// а Виктор может отправить её туристу со своего WhatsApp (ссылка в Telegram).
export function bookingSummaryRu(b: ParkBooking, confirmUrl: string | null): string {
  const dest = DESTINATIONS[b.destination]
  const pkg = dest.packages.find((p) => p.id === b.packageId)!
  const slot = findSlot(b.destination, b.departureTime)
  const date = ruDate(b.date)
  const guests = dest.guests
    .filter((g) => b.guests[g.key])
    .map((g) => `${g.formLabel}: ${b.guests[g.key]}`)
    .join(", ")
  const extras = dest.extras.filter((x) => b.extras[x.key])
  const lines = [
    "📋 Заявка ВикТур",
    "",
    `🎟 ${b.destination === "hontam" ? "Остров Хон Там" : "VinWonders"} — ${pkg.title}`,
    `📅 ${date}`,
  ]
  if (slot) {
    lines.push(
      slot.boat
        ? `🚤 Катер ${slot.boat}, выезд от отеля ${slot.pickup} (±10 мин)`
        : `🚐 Выезд от отеля в ${slot.pickup} (±10 мин)`,
    )
  }
  lines.push(`👥 ${guests}`, `🏨 Отель: ${b.hotel}`, `👤 ${b.name}`)
  if (extras.length) {
    lines.push(`➕ ${extras.map((x) => `${x.label} × ${b.extras[x.key]}`).join("; ")}`)
  }
  if (b.comment) lines.push(`💬 ${b.comment}`)
  if (confirmUrl) lines.push("", `✅ Подтвердить выезд утром: ${confirmUrl}`)
  return lines.join("\n")
}


/** Напоминание «подтвердите выезд за час» — Виктор отправляет со своего WhatsApp. */
export function reminderRu(
  d: { dest: DestinationId; date: string; boat: string | null; pickup: string | null; name: string },
  confirmUrl: string,
): string {
  const place = d.dest === "hontam" ? "поездка на остров Хон Там" : "поездка в VinWonders"
  const lines = [`Здравствуйте, ${d.name}! Это ВикТур 👋`, "", `Напоминаем: ${ruDate(d.date)} — ${place}.`]
  if (d.pickup) lines.push(`🚐 Выезд от отеля в ${d.pickup} (±10 мин)${d.boat ? `, катер в ${d.boat}` : ""}.`)
  lines.push("", `Пожалуйста, подтвердите выезд за час — одной кнопкой по ссылке: ${confirmUrl}`)
  return lines.join("\n")
}

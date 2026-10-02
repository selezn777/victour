import { confirmSummaryRu, readConfirmToken, reminderAtUtc } from "@/lib/park-confirm"

// Напоминание в календарь телефона: событие за час до выезда со ссылкой на
// страницу подтверждения. Открытие .ics на iPhone/Android сразу предлагает
// добавить событие в календарь.
const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
// RFC 5545: строки длиннее 75 байт переносятся с пробелом в начале продолжения
function fold(line: string): string {
  const out: string[] = []
  let cur = ""
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch) > 74) {
      out.push(cur)
      cur = " "
    }
    cur += ch
  }
  out.push(cur)
  return out.join("\r\n")
}
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n")

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  const data = readConfirmToken(token)
  if (!data) return new Response("Invalid link", { status: 400 })

  const start = reminderAtUtc(data)
  const end = new Date(start.getTime() + 15 * 60 * 1000)
  const confirmUrl = `${url.origin}/park/confirm/${token}`
  const when = data.pickup
    ? `Выезд от отеля в ${data.pickup} (±10 мин)${data.boat ? `, катер ${data.boat}` : ""}.`
    : "Сегодня поездка в VinWonders."
  const description = `${confirmSummaryRu(data)}\n${when}\nПодтвердите выезд одной кнопкой: ${confirmUrl}`

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VicTour//Park//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${token.slice(-22)}@victour`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText("✅ Подтвердить выезд — ВикТур")}`,
    `DESCRIPTION:${icsText(description)}`,
    `URL:${confirmUrl}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:PT0M",
    `DESCRIPTION:${icsText("Подтвердите выезд — ВикТур")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n")

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="victour-podtverdit-vyezd.ics"',
    },
  })
}

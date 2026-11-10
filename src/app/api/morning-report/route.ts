import { createClient } from "@supabase/supabase-js"
import { DESTINATIONS, type DestinationId } from "@/app/park/park-config"

// Утренний отчёт Виктору в Telegram, 07:00 по Вьетнаму (Vercel Cron, vercel.json).
// Виктор 2026-11-09: «каждое утро в 7 отчёт: кто, откуда, куда едет, сколько денег,
// номера, отели, трансфер, на какой стадии; сегодня и на завтра предварительно;
// не всё в кучу, а разбито». Плюс клиенты из CRM, кому пора написать.

const TOUR_STATUS: Record<string, string> = {
  pending: "⏳ ждёт подтверждения",
  confirmed: "✅ подтверждён",
  alt_proposed: "🔁 предложена другая дата",
  cancelled: "❌ отменён",
  completed: "🏁 завершён",
}
const PARK_STAGE: Record<string, string> = {
  new: "🆕 новая, не передана",
  client_confirmed: "👍 турист подтвердил выезд, не передана",
  passed: "✅ передана (билеты/водитель)",
  done: "🏁 съездили",
  cancelled: "❌ отказались",
}
const CRM_STATUS: Record<string, string> = { new: "новый", thinking: "думает", on_arrival: "напишет по приезду" }
const GUEST_RU: Record<string, string> = { adults: "взр", children: "дет", seniors: "60+", infants: "малыш" }

type Item = {
  date: string
  adults: number
  children: number
  departure_time: string | null
  tours: { title: { ru?: string } | null } | null
  bookings: {
    guest_name: string
    contact_channel: string
    contact_value: string
    hotel: string
    status: string
    payment_status: string
    total_usd: number
    prepayment_usd: number
    notes: string | null
  } | null
}
type Park = {
  date: string
  destination: string
  package_title: string | null
  departure_time: string | null
  guests: Record<string, number>
  guests_total: number
  extras: Record<string, number>
  hotel: string
  district: string | null
  transfer_usd: number | null
  tickets_vnd: number | null
  name: string
  contact_channel: string
  contact: string
  comment: string | null
  stage: string
  note: string | null
}

function vnDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000)
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d)
}
function dm(d: string): string {
  const [y, m, day] = d.split("-").map(Number)
  const wd = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"][new Date(Date.UTC(y, m - 1, day)).getUTCDay()]
  return `${String(day).padStart(2, "0")}.${String(m).padStart(2, "0")} (${wd})`
}
const vnd = (n: number) => `${n.toLocaleString("ru-RU").replace(/ /g, " ")} ₫`

function tourBlock(items: Item[]): { text: string[]; total: number; due: number } {
  const text: string[] = []
  let total = 0
  let due = 0
  items.forEach((it, i) => {
    const b = it.bookings
    if (!b) return
    const people = [`${it.adults} взр`, it.children ? `${it.children} дет` : ""].filter(Boolean).join(" + ")
    const left = b.payment_status === "confirmed" ? b.total_usd - b.prepayment_usd : b.total_usd
    if (b.status !== "cancelled") {
      total += b.total_usd
      due += left
    }
    text.push(
      `${i + 1}. ${it.tours?.title?.ru ?? "Тур"} - ${b.guest_name}`,
      `   👥 ${people}${it.departure_time ? `, выезд ${it.departure_time}` : ""}`,
      `   🏨 ${b.hotel}`,
      `   📱 ${b.contact_channel}: ${b.contact_value}`,
      `   💰 $${b.total_usd}, предоплата $${b.prepayment_usd} ${b.payment_status === "confirmed" ? "получена" : "НЕ получена"}, к получению $${left}`,
      `   📌 ${TOUR_STATUS[b.status] ?? b.status}`,
      ...(b.notes ? [`   💬 ${b.notes}`] : []),
      "",
    )
  })
  return { text, total, due }
}

function parkBlock(rows: Park[]): { text: string[]; vndSum: number; usdSum: number } {
  const text: string[] = []
  let vndSum = 0
  let usdSum = 0
  rows.forEach((r, i) => {
    const dest = DESTINATIONS[r.destination as DestinationId]
    const extrasDef = dest?.extras ?? []
    const guests = Object.entries(r.guests)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${n} ${GUEST_RU[k] ?? k}`)
      .join(", ")
    const extras = extrasDef.filter((e) => r.extras[e.key]).map((e) => `${e.label} × ${r.extras[e.key]}`)
    if (r.stage !== "cancelled") {
      vndSum += r.tickets_vnd ?? 0
      usdSum += r.transfer_usd ?? 0
    }
    text.push(
      `${i + 1}. ${dest?.placeRu ?? r.destination} - ${r.name}`,
      `   🎫 ${r.package_title ?? "билет"}, ${r.guests_total} чел. (${guests})${r.departure_time ? `, выезд ${r.departure_time}` : ""}`,
      ...(extras.length ? [`   ➕ ${extras.join("; ")}`] : []),
      `   🏨 ${r.hotel}`,
      `   🚐 ${r.district ? `трансфер: ${r.district}, $${r.transfer_usd}` : "трансфер бесплатный / не нужен"}`,
      `   📱 ${r.contact_channel}: ${r.contact}`,
      `   💰 билеты ≈ ${vnd(r.tickets_vnd ?? 0)}${r.transfer_usd ? ` + трансфер $${r.transfer_usd}` : ""}`,
      `   📌 ${PARK_STAGE[r.stage] ?? r.stage}`,
      ...(r.comment ? [`   💬 ${r.comment}`] : []),
      ...(r.note ? [`   📝 ${r.note}`] : []),
      "",
    )
  })
  return { text, vndSum, usdSum }
}

function dayReport(title: string, day: string, items: Item[], parks: Park[]): string[] {
  const t = items.filter((i) => i.date === day)
  const p = parks.filter((r) => r.date === day)
  const out = [`━━━━━━━━━━━━`, `📅 ${title}, ${dm(day)}`, ""]
  if (t.length === 0 && p.length === 0) return [...out, "Записей нет", ""]
  const tb = tourBlock(t)
  const pb = parkBlock(p)
  if (t.length) out.push(`🚐 ТУРЫ (${t.length})`, "", ...tb.text)
  if (p.length) out.push(`🎟 БИЛЕТЫ И ТРАНСФЕРЫ (${p.length})`, "", ...pb.text)
  out.push(
    "💵 Итого за день:",
    ...(t.length ? [`   туры $${tb.total}, к получению $${tb.due}`] : []),
    ...(p.length ? [`   билеты ≈ ${vnd(pb.vndSum)}, трансферы $${pb.usdSum}`] : []),
    "",
  )
  return out
}

/** Telegram ограничивает сообщение 4096 символами - режем по строкам. */
function chunks(lines: string[], max = 3800): string[] {
  const res: string[] = []
  let cur = ""
  for (const l of lines) {
    if (cur.length + l.length + 1 > max) {
      res.push(cur)
      cur = ""
    }
    cur += (cur ? "\n" : "") + l
  }
  if (cur.trim()) res.push(cur)
  return res
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return Response.json({ ok: false, error: "telegram not configured" }, { status: 500 })

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
  const today = vnDate(0)
  const tomorrow = vnDate(1)

  const [itemsRes, parkRes, crmRes] = await Promise.all([
    db
      .from("booking_items")
      .select(
        "date, adults, children, departure_time, tours(title), bookings(guest_name, contact_channel, contact_value, hotel, status, payment_status, total_usd, prepayment_usd, notes)",
      )
      .in("date", [today, tomorrow])
      .order("departure_time"),
    db.from("park_bookings").select("*").in("date", [today, tomorrow]).order("created_at"),
    db
      .from("crm_clients")
      .select("name, channel, contact, status, date_from, people, tour, note, remind_on")
      .in("status", ["new", "thinking", "on_arrival"])
      .lte("remind_on", today)
      .order("remind_on"),
  ])

  const items = (itemsRes.data ?? []) as unknown as Item[]
  const parks = (parkRes.data ?? []) as Park[]
  const lines = [
    `☀️ Доброе утро! Отчёт на ${dm(today)}`,
    "",
    ...dayReport("СЕГОДНЯ", today, items, parks),
    ...dayReport("ЗАВТРА (предварительно)", tomorrow, items, parks),
  ]

  const crm = (crmRes.data ?? []) as {
    name: string
    channel: string
    contact: string | null
    status: string
    date_from: string | null
    people: number | null
    tour: string | null
    note: string | null
    remind_on: string
  }[]
  lines.push("━━━━━━━━━━━━", `🔔 CRM: ПОРА НАПИСАТЬ (${crm.length})`, "")
  if (crm.length === 0) lines.push("Сегодня никому", "")
  crm.forEach((c, i) =>
    lines.push(
      `${i + 1}. ${c.name} (${CRM_STATUS[c.status] ?? c.status})${c.remind_on < today ? `, просрочено с ${dm(c.remind_on)}` : ""}`,
      `   📱 ${c.channel}${c.contact ? `: ${c.contact}` : ""}`,
      ...(c.date_from || c.people || c.tour
        ? [`   🗓 ${[c.date_from ? `с ${dm(c.date_from)}` : "", c.people ? `${c.people} чел.` : "", c.tour ?? ""].filter(Boolean).join(", ")}`]
        : []),
      ...(c.note ? [`   💬 ${c.note}`] : []),
      "",
    ),
  )

  const errors = [itemsRes.error, parkRes.error, crmRes.error].filter(Boolean).map((e) => e!.message)
  if (errors.length) lines.push(`⚠️ Не всё загрузилось: ${errors.join("; ")}`)
  lines.push("Админка: victour.online/admin")

  for (const text of chunks(lines)) {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
    })
    if (!res.ok) return Response.json({ ok: false, error: "telegram send failed" }, { status: 502 })
  }
  return Response.json({ ok: true, errors })
}

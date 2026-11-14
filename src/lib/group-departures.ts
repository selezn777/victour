import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { matchGroupProgram } from "@/lib/group-tours"
import { todayInVietnam, type ParsedDeparture } from "@/lib/group-schedule-parse"

// Доступ к групповым выездам (таблица group_departures, миграция 20261114120000).
// Клиент без типов Database: таблицы нет в database.types.ts, а до применения миграции
// её нет и в базе - тогда сайт показывает пустой раздел, а бот просит применить миграцию.

export type GroupDeparture = {
  id: string
  num: number
  date: string
  time: string | null
  tourTitle: string
  tourSlug: string | null
  guideName: string | null
  seatsTotal: number
  seatsBooked: number
  priceUsd: number | null
  status: "open" | "cancelled"
}

type Row = {
  id: string
  num: number
  date: string
  time: string | null
  tour_title: string
  tour_slug: string | null
  guide_name: string | null
  seats_total: number
  seats_booked: number
  price_usd: number | string | null
  status: "open" | "cancelled"
}

const COLUMNS = "id, num, date, time, tour_title, tour_slug, guide_name, seats_total, seats_booked, price_usd, status"

function fromRow(r: Row): GroupDeparture {
  return {
    id: r.id,
    num: r.num,
    date: r.date,
    time: r.time,
    tourTitle: r.tour_title,
    tourSlug: r.tour_slug,
    guideName: r.guide_name,
    seatsTotal: r.seats_total,
    seatsBooked: r.seats_booked,
    priceUsd: r.price_usd === null ? null : Number(r.price_usd),
    status: r.status,
  }
}

export function seatsLeft(d: Pick<GroupDeparture, "seatsTotal" | "seatsBooked">): number {
  return Math.max(0, d.seatsTotal - d.seatsBooked)
}

/** Таблицы ещё нет (миграция не применена) */
export function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  return !!error && (error.code === "PGRST205" || error.code === "42P01" || /group_departures|group_signups/.test(error.message ?? "") && /schema cache|does not exist/.test(error.message ?? ""))
}

export function serviceDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

function anonDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

// ---------- Сайт ----------

/** Открытые выезды с сегодняшнего дня (для /groups). Никогда не бросает. */
export async function getUpcomingDepartures(): Promise<GroupDeparture[]> {
  if (process.env.NODE_ENV !== "production" && process.env.GROUP_DEPARTURES_FIXTURE === "1") return fixture()
  const db = anonDb()
  if (!db) return []
  try {
    const { data, error } = await db
      .from("group_departures")
      .select(COLUMNS)
      .eq("status", "open")
      .gte("date", todayInVietnam())
      .order("date")
      .order("time", { nullsFirst: true })
      .limit(200)
    if (error) {
      if (!isMissingTable(error)) console.error("group-departures: read failed:", error.message)
      return []
    }
    return (data as Row[]).map(fromRow)
  } catch (err) {
    console.error("group-departures: read error:", err)
    return []
  }
}

export async function getOpenDepartureById(id: string): Promise<GroupDeparture | null> {
  const db = serviceDb()
  if (!db) return null
  const { data, error } = await db.from("group_departures").select(COLUMNS).eq("id", id).maybeSingle()
  if (error || !data) return null
  const d = fromRow(data as Row)
  return d.status === "open" && d.date >= todayInVietnam() ? d : null
}

// ---------- Бот ----------

export type DbResult<T> = { ok: true; value: T } | { ok: false; missingTable: boolean; error: string }

function fail<T>(error: { code?: string; message?: string }): DbResult<T> {
  return { ok: false, missingTable: isMissingTable(error), error: error.message ?? "unknown" }
}

/** Привязка названия из расписания: групповая программа или индивидуальный тур с похожим названием. */
export async function resolveTourSlug(db: SupabaseClient, title: string): Promise<string | null> {
  const program = matchGroupProgram(title)
  if (program) return program.slug
  const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\d.]+/gu, " ").trim()
  const t = norm(title)
  if (t.length < 3) return null
  const { data } = await db.from("tours").select("slug, title").eq("is_active", true)
  for (const row of (data ?? []) as { slug: string; title: { ru?: string } | string }[]) {
    const name = norm(typeof row.title === "string" ? row.title : (row.title?.ru ?? ""))
    if (name && (name === t || name.startsWith(t) || name.includes(t))) return row.slug
  }
  return null
}

/** Новый выезд или обновление того же (дата + тур + время). */
export async function upsertDeparture(
  db: SupabaseClient,
  p: ParsedDeparture,
  tourSlug: string | null,
): Promise<DbResult<{ departure: GroupDeparture; created: boolean }>> {
  let q = db.from("group_departures").select(COLUMNS).eq("date", p.date).ilike("tour_title", p.tourTitle.replace(/[%_\\]/g, "\\$&"))
  q = p.time ? q.eq("time", p.time) : q.is("time", null)
  const existing = await q.maybeSingle()
  if (existing.error) return fail(existing.error)

  const fields = {
    date: p.date,
    time: p.time,
    tour_title: p.tourTitle,
    tour_slug: tourSlug,
    guide_name: p.guideName,
    seats_total: p.seatsTotal,
    price_usd: p.priceUsd,
    status: "open",
    updated_at: new Date().toISOString(),
  }
  if (existing.data) {
    const prev = existing.data as Row
    const { data, error } = await db
      .from("group_departures")
      .update({
        ...fields,
        // не затираем то, чего нет в новой строке
        guide_name: p.guideName ?? prev.guide_name,
        price_usd: p.priceUsd ?? prev.price_usd,
        seats_booked: p.seatsBooked || prev.seats_booked,
      })
      .eq("id", prev.id)
      .select(COLUMNS)
      .single()
    if (error) return fail(error)
    return { ok: true, value: { departure: fromRow(data as Row), created: false } }
  }
  const { data, error } = await db
    .from("group_departures")
    .insert({ ...fields, seats_booked: p.seatsBooked })
    .select(COLUMNS)
    .single()
  if (error) return fail(error)
  return { ok: true, value: { departure: fromRow(data as Row), created: true } }
}

export async function listForBot(db: SupabaseClient): Promise<DbResult<{ departures: GroupDeparture[]; signups: Record<string, number> }>> {
  const { data, error } = await db
    .from("group_departures")
    .select(COLUMNS)
    .gte("date", todayInVietnam())
    .order("date")
    .order("time", { nullsFirst: true })
    .limit(60)
  if (error) return fail(error)
  const departures = (data as Row[]).map(fromRow)
  const signups: Record<string, number> = {}
  if (departures.length) {
    const s = await db
      .from("group_signups")
      .select("departure_id, people")
      .in("departure_id", departures.map((d) => d.id))
      .eq("status", "new")
    for (const r of (s.data ?? []) as { departure_id: string; people: number }[]) {
      signups[r.departure_id] = (signups[r.departure_id] ?? 0) + r.people
    }
  }
  return { ok: true, value: { departures, signups } }
}

export async function getByNum(db: SupabaseClient, num: number): Promise<DbResult<GroupDeparture | null>> {
  const { data, error } = await db.from("group_departures").select(COLUMNS).eq("num", num).maybeSingle()
  if (error) return fail(error)
  return { ok: true, value: data ? fromRow(data as Row) : null }
}

export async function updateByNum(
  db: SupabaseClient,
  num: number,
  patch: Partial<Pick<Row, "seats_total" | "seats_booked" | "price_usd" | "status" | "guide_name" | "time">>,
): Promise<DbResult<GroupDeparture | null>> {
  const { data, error } = await db
    .from("group_departures")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("num", num)
    .select(COLUMNS)
    .maybeSingle()
  if (error) return fail(error)
  return { ok: true, value: data ? fromRow(data as Row) : null }
}

export async function deleteByNum(db: SupabaseClient, num: number): Promise<DbResult<GroupDeparture | null>> {
  const { data, error } = await db.from("group_departures").delete().eq("num", num).select(COLUMNS).maybeSingle()
  if (error) return fail(error)
  return { ok: true, value: data ? fromRow(data as Row) : null }
}

// ---------- Пример данных для локальной проверки вёрстки (GROUP_DEPARTURES_FIXTURE=1, не в проде) ----------

function fixture(): GroupDeparture[] {
  const base = Date.parse(`${todayInVietnam()}T00:00:00Z`)
  const day = (n: number) => new Date(base + n * 86400_000).toISOString().slice(0, 10)
  const mk = (i: number, d: number, time: string, title: string, slug: string | null, guide: string | null, total: number, booked: number, price: number | null): GroupDeparture => ({
    id: `fx-${i}`,
    num: i,
    date: day(d),
    time,
    tourTitle: title,
    tourSlug: slug,
    guideName: guide,
    seatsTotal: total,
    seatsBooked: booked,
    priceUsd: price,
    status: "open",
  })
  return [
    mk(1, 2, "08:30", "Настоящий Фукуок с историком", "gruppa-istorik", "Виктор", 12, 7, 35),
    mk(2, 2, "15:00", "Вечерний Фукуок и ночное сафари", "gruppa-vecher", null, 12, 12, 49),
    mk(3, 4, "07:30", "Южные острова", "gruppa-ostrova", null, 10, 3, 45),
    mk(4, 6, "09:00", "Юг 2.0", null, "Виктор", 8, 0, 60),
    mk(5, 9, "08:30", "Настоящий Фукуок с историком", "gruppa-istorik", "Виктор", 12, 11, 35),
  ]
}

// Переносит src/lib/group-schedule-static.json в group_departures (после применения миграции 20261114120000).
// Повторный запуск обновляет те же строки (дата + название, без времени).
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { rows } = JSON.parse(readFileSync(new URL("../src/lib/group-schedule-static.json", import.meta.url), "utf8"))
let created = 0, updated = 0
for (const [date, title, slug, total, booked, price] of rows) {
  const row = { date, time: null, tour_title: title, tour_slug: slug, seats_total: total, seats_booked: booked, price_usd: price, status: "open", updated_at: new Date().toISOString() }
  const ex = await db.from("group_departures").select("id").eq("date", date).eq("tour_title", title).is("time", null).maybeSingle()
  if (ex.error) throw ex.error
  const r = ex.data ? await db.from("group_departures").update(row).eq("id", ex.data.id) : await db.from("group_departures").insert(row)
  if (r.error) throw r.error
  ex.data ? updated++ : created++
}
console.log({ created, updated })

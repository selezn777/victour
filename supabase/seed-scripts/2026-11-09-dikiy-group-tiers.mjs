// «Дикий Фукуок»: вместо $80 с человека - тарифная сетка как у «Настоящего Фукуока»
// (Виктор 2026-11-09: «примерно также сделай ... округляй до красивых цифр»).
// Группы 10-13 достраивает src/lib/group-tiers.ts.
// Запуск: node --env-file=.env.local supabase/seed-scripts/2026-11-09-dikiy-group-tiers.mjs
import { createClient } from "@supabase/supabase-js"

const TIERS = [[2, 175], [3, 120], [4, 90], [5, 75], [6, 65], [7, 55], [8, 50], [9, 45]]
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: tour, error: te } = await s.from("tours").select("id").eq("slug", "phuquoc-dikiy").single()
if (te) throw te
for (const [g, p] of TIERS) {
  const { error } = await s.from("pricing_tiers").update({ price_adult_usd: p }).eq("tour_id", tour.id).eq("guest_count", g)
  if (error) throw error
}
const { data } = await s.from("pricing_tiers").select("guest_count,price_adult_usd").eq("tour_id", tour.id).order("guest_count")
console.log(data.map((r) => `${r.guest_count}: $${r.price_adult_usd}`).join(", "))

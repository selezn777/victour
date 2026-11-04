// Группы до 15 человек на сайте (Виктор 2026-11-04: «у меня есть автобус, целую
// компанию свожу»). Существующие тарифы не трогаем (для Фукуока 2-4 = цены
// Трипстера), достраиваем недостающие до 15:
//   до 9 человек - та же машина: сумма за группу растёт только на «расход на
//   человека» (билеты/вода, берём из разницы последних двух тарифов, минимум $5);
//   с 10 человек - автобус, +$80 к сумме группы (Далат 2 дня: +$160, два дня).
// Цена за человека округляется вверх до $5.
// Запуск: node supabase/seed-scripts/2026-11-04-group-tiers-to-15.mjs [--apply]
import fs from "fs"
import { createClient } from "@supabase/supabase-js"
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]
  }),
)
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const apply = process.argv.includes("--apply")
// В базе check (guest_count between 2 and 9), DDL из этой сессии недоступен:
// 5-9 пишем в базу, 10-15 достраивает код (src/lib/group-tiers.ts) той же формулой.
const MAX = 9
const BUS_FROM = 10
const busExtra = (slug) => (slug === "dalat-2-dnya" ? 160 : 80)
const up5 = (x) => Math.ceil(x / 5) * 5

const { data: tours, error } = await s.from("tours").select("id,slug,pricing_tiers(*)").eq("is_active", true)
if (error) throw error
const inserts = []
for (const t of tours) {
  const tiers = t.pricing_tiers.sort((a, b) => a.guest_count - b.guest_count)
  const last = tiers[tiers.length - 1]
  const prev = tiers[tiers.length - 2]
  const total = (p) => p.price_adult_usd * p.guest_count
  const perHead = Math.max(5, prev ? (total(last) - total(prev)) / (last.guest_count - prev.guest_count) : 5)
  const line = tiers.map((p) => `${p.guest_count}:${p.price_adult_usd}`)
  for (let n = last.guest_count + 1; n <= MAX; n++) {
    let sum = total(last) + perHead * (n - last.guest_count)
    if (n >= BUS_FROM && last.guest_count < BUS_FROM) sum += busExtra(t.slug)
    const price = up5(sum / n)
    inserts.push({ tour_id: t.id, guest_count: n, price_adult_usd: price, price_child_usd: null })
    line.push(`*${n}:${price}`)
  }
  console.log(t.slug.padEnd(24), `(+$${perHead}/чел)`, line.join(" "))
}
if (apply) {
  const { error: e2 } = await s.from("pricing_tiers").insert(inserts)
  if (e2) throw e2
  console.log("вставлено", inserts.length)
} else console.log("dry run, --apply чтобы записать")

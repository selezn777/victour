// Группы 10-15 человек (Виктор 2026-11-04: «у меня есть автобус, целую компанию
// свожу»). В базе pricing_tiers ограничен check (guest_count between 2 and 9),
// поэтому большие группы достраиваются здесь, той же формулой, что и
// supabase/seed-scripts/2026-11-04-group-tiers-to-15.mjs:
//   сумма за группу = сумма за самый большой тариф из базы
//                     + «расход на человека» (разница двух последних тарифов, минимум $5)
//                     + автобус с 10 человек ($80, Далат 2 дня - $160 за два дня),
//   цена за человека округляется вверх до $5.

export const MAX_GROUP = 15
const BUS_FROM = 10

type Tier = { guestCount: number; priceAdultUsd: number; priceChildUsd: number | null }

const busExtraUsd = (slug: string) => (slug === "dalat-2-dnya" ? 160 : 80)
const up5 = (x: number) => Math.ceil(x / 5) * 5

/** Тарифы из базы (любой порядок) -> отсортированные и дополненные до MAX_GROUP. */
export function extendGroupTiers<T extends Tier>(slug: string, tiers: T[]): Tier[] {
  const sorted = [...tiers].sort((a, b) => a.guestCount - b.guestCount)
  const last = sorted[sorted.length - 1]
  if (!last) return sorted
  const prev = sorted[sorted.length - 2]
  const total = (t: Tier) => t.priceAdultUsd * t.guestCount
  const perHead = Math.max(5, prev ? (total(last) - total(prev)) / (last.guestCount - prev.guestCount) : 5)
  const out: Tier[] = sorted.map((t) => ({ guestCount: t.guestCount, priceAdultUsd: t.priceAdultUsd, priceChildUsd: t.priceChildUsd }))
  for (let n = last.guestCount + 1; n <= MAX_GROUP; n++) {
    let sum = total(last) + perHead * (n - last.guestCount)
    if (n >= BUS_FROM && last.guestCount < BUS_FROM) sum += busExtraUsd(slug)
    out.push({ guestCount: n, priceAdultUsd: up5(sum / n), priceChildUsd: null })
  }
  return out
}

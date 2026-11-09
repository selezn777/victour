// Группы 10-13 человек (Виктор 2026-11-04: «у меня есть автобус, целую компанию
// свожу»). В базе pricing_tiers ограничен check (guest_count between 2 and 9),
// поэтому большие группы достраиваются здесь, той же формулой, что и
// supabase/seed-scripts/2026-11-04-group-tiers-to-15.mjs:
//   сумма за группу = сумма за самый большой тариф из базы
//                     + «расход на человека» (разница двух последних тарифов, минимум $5)
//                     + автобус с 10 человек ($80, Далат 2 дня - $160 за два дня),
//   цена за человека округляется вверх до $5.

export const MAX_GROUP = 13 // Виктор 2026-11-09: «до 13 человек ... все туры»
const BUS_FROM = 10

type Tier = { guestCount: number; priceAdultUsd: number; priceChildUsd: number | null }

// Свои цены для больших групп, если у тура есть готовый прайс партнёра.
// «Хойан + Дананг» (друзья Виктора, 2026-11-09): 8-10 человек $670, больше 10 - от $600 с человека.
const FIXED_BIG_GROUP_USD: Record<string, Record<number, number>> = {
  "phuquoc-hoian-danang": { 10: 670, 11: 600, 12: 600, 13: 600 },
}

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
  // Цена «с человека» без тарифной сетки (все тарифы одинаковые, напр. «Дикий
  // Фукуок» $80 - всё включено): большие группы по той же цене.
  const flat = sorted.every((t) => t.priceAdultUsd === last.priceAdultUsd)
  const out: Tier[] = sorted.map((t) => ({ guestCount: t.guestCount, priceAdultUsd: t.priceAdultUsd, priceChildUsd: t.priceChildUsd }))
  for (let n = last.guestCount + 1; n <= MAX_GROUP; n++) {
    const fixed = FIXED_BIG_GROUP_USD[slug]?.[n]
    if (fixed) {
      out.push({ guestCount: n, priceAdultUsd: fixed, priceChildUsd: null })
      continue
    }
    if (flat) {
      out.push({ guestCount: n, priceAdultUsd: last.priceAdultUsd, priceChildUsd: null })
      continue
    }
    let sum = total(last) + perHead * (n - last.guestCount)
    if (n >= BUS_FROM && last.guestCount < BUS_FROM) sum += busExtraUsd(slug)
    out.push({ guestCount: n, priceAdultUsd: up5(sum / n), priceChildUsd: null })
  }
  return out
}

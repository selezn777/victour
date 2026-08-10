// Чистые функции скидок и валют — правила из docs/VicTour_tours-and-prices.md.
// Курс/наценка/скидки читаются из таблицы `settings`, сюда передаются параметром.

export type PricingTier = {
  guest_count: number
  price_adult_usd: number
  price_child_usd: number | null
}

export type PackageDiscounts = Record<string, number> // {"2": 5, "3": 10, "4": 15}

/** Цена за одного гостя из сетки тура для заданного числа гостей в компании. */
export function findAdultPrice(tiers: PricingTier[], guestCount: number): number {
  const tier = tiers.find((t) => t.guest_count === guestCount)
  if (!tier) {
    throw new Error(`Нет цены для ${guestCount} гостей`)
  }
  return tier.price_adult_usd
}

export function findChildPrice(tiers: PricingTier[], guestCount: number): number | null {
  const tier = tiers.find((t) => t.guest_count === guestCount)
  return tier?.price_child_usd ?? null
}

/** Скидка в процентах за количество туров в пакете (2/3/4 → 5/10/15%). Далат считается одним туром. */
export function packageDiscountPct(tourCount: number, discounts: PackageDiscounts): number {
  return discounts[String(tourCount)] ?? 0
}

/**
 * Итог по пакету: сумма позиций минус скидка, плюс доплаты (не скидируются — например,
 * дальний трансфер Камрань/Amiana).
 */
export function calculatePackageTotal(params: {
  itemsSubtotalUsd: number
  tourCount: number
  discounts: PackageDiscounts
  surchargeUsd?: number
}): { subtotalUsd: number; discountPct: number; discountUsd: number; surchargeUsd: number; totalUsd: number } {
  const { itemsSubtotalUsd, tourCount, discounts, surchargeUsd = 0 } = params
  const discountPct = packageDiscountPct(tourCount, discounts)
  const discountUsd = round2((itemsSubtotalUsd * discountPct) / 100)
  const totalUsd = round2(itemsSubtotalUsd - discountUsd + surchargeUsd)
  return { subtotalUsd: round2(itemsSubtotalUsd), discountPct, discountUsd, surchargeUsd: round2(surchargeUsd), totalUsd }
}

/** Предоплата — фиксированная небольшая сумма (не процент от заявки), задаётся в settings. */
export function calculatePrepayment(depositUsd: number): number {
  return round2(depositUsd)
}

export function usdToVnd(usd: number, vndRate: number): number {
  return Math.round(usd * vndRate)
}

/** Рублёвая цена по курсу с рабочей наценкой (по умолчанию ~8%) на конвертацию. */
export function usdToRub(usd: number, usdRubRate: number, markupPct = 8): number {
  return round2(usd * usdRubRate * (1 + markupPct / 100))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Чистые функции цен и валют — правила из docs/VicTour_tours-and-prices.md.
// Курс/наценка читаются из таблицы `settings`, сюда передаются параметром.
// Пакетных скидок больше нет (Виктор попросил убрать полностью).

export type PricingTier = {
  guest_count: number
  price_adult_usd: number
  price_child_usd: number | null
}

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

/**
 * Итог по пакету: сумма позиций плюс доплаты (например, дальний трансфер
 * Камрань/Amiana). Пакетных скидок больше нет — Виктор явно попросил убрать
 * их полностью.
 */
export function calculatePackageTotal(params: {
  itemsSubtotalUsd: number
  surchargeUsd?: number
}): { subtotalUsd: number; surchargeUsd: number; totalUsd: number } {
  const { itemsSubtotalUsd, surchargeUsd = 0 } = params
  const totalUsd = round2(itemsSubtotalUsd + surchargeUsd)
  return { subtotalUsd: round2(itemsSubtotalUsd), surchargeUsd: round2(surchargeUsd), totalUsd }
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

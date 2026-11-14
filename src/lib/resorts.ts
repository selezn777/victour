// Курорты, где мы сейчас работаем. Колонки "курорт" в таблице tours нет
// (DDL-миграции в этом проекте применить нельзя без пароля Postgres), поэтому
// привязка тура к курорту — здесь, по slug. Нячанг и Камрань — одна зона
// (из Камрани едем по тем же маршрутам), Фукуок — свои туры.
export type ResortId = "nyachang" | "kamran" | "phuquoc"
export type ResortArea = "nyachang" | "phuquoc"

export const RESORTS: { id: ResortId; label: string; area: ResortArea }[] = [
  { id: "nyachang", label: "Нячанг", area: "nyachang" },
  { id: "kamran", label: "Камрань", area: "nyachang" },
  { id: "phuquoc", label: "Фукуок", area: "phuquoc" },
]

/** Туры Фукуока по slug; всё остальное считается зоной Нячанга/Камрани. */
const PHUQUOC_TOUR_SLUGS = new Set(["phuquoc-vecher-safari", "phuquoc-nastoyashchiy", "phuquoc-dikiy", "phuquoc-utro", "phuquoc-utro-safari", "phuquoc-ostrova", "phuquoc-sunset-town", "phuquoc-hoian-danang"])

export function tourArea(slug: string): ResortArea {
  return PHUQUOC_TOUR_SLUGS.has(slug) || slug.startsWith("phuquoc-") ? "phuquoc" : "nyachang"
}

/** Камрань далеко от Нячанга — Виктор: +$20 на ВСЮ группу (не на человека),
 *  туры те же. Для туров других зон доплаты нет. */
export const KAMRAN_SURCHARGE_GROUP_USD = 20

/** Доплата за человека при группе guests: $20 делим на группу, вверх до доллара. */
export function resortSurchargePerPersonUsd(
  resort: ResortId | null,
  tourSlug: string,
  guests: number,
): number {
  if (resort !== "kamran" || tourArea(tourSlug) !== "nyachang") return 0
  return Math.ceil(KAMRAN_SURCHARGE_GROUP_USD / Math.max(1, guests))
}

export function resortById(id: ResortId | null) {
  return RESORTS.find((r) => r.id === id) ?? null
}

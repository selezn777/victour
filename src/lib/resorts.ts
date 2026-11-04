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
const PHUQUOC_TOUR_SLUGS = new Set(["phuquoc-vecher-safari", "phuquoc-nastoyashchiy"])

export function tourArea(slug: string): ResortArea {
  return PHUQUOC_TOUR_SLUGS.has(slug) ? "phuquoc" : "nyachang"
}

/** Камрань далеко от Нячанга — Виктор: к каждой цене +$20 (за человека),
 *  туры те же. Для туров других зон наценки нет. */
export const KAMRAN_SURCHARGE_USD = 20

export function resortSurchargeUsd(resort: ResortId | null, tourSlug: string): number {
  return resort === "kamran" && tourArea(tourSlug) === "nyachang" ? KAMRAN_SURCHARGE_USD : 0
}

export function resortById(id: ResortId | null) {
  return RESORTS.find((r) => r.id === id) ?? null
}

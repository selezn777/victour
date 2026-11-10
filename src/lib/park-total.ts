import { DESTINATIONS, findDistrict, type ParkBooking } from "@/app/park/park-config"

// Мини-чек заявки на билеты (Виктор 2026-11-10: «суммы не хватает, чтобы все видели,
// сколько они должны будут оплатить»). Чистые функции: работают и в форме, и на сервере.

/** "850K ₫", "1 150K ₫", "1 200K ₫ (сб-вс 1 300K)" → 850000 / 1150000 / 1200000 */
export function parseVndK(price: string | undefined): number {
  if (!price) return 0
  const m = price.match(/([\d\s]+)\s*K/)
  return m ? Number(m[1].replace(/\s/g, "")) * 1000 : 0
}

export type ReceiptLine = { label: string; qty: number; unitVnd: number; sumVnd: number }

export type Receipt = {
  lines: ReceiptLine[]
  people: number
  ticketsVnd: number
  transferUsd: number | null
  transferLabel: string | null
}

type ReceiptInput = Pick<ParkBooking, "destination" | "packageId" | "guests" | "extras" | "district">

export function buildReceipt(b: ReceiptInput): Receipt {
  const dest = DESTINATIONS[b.destination]
  const pkg = dest.packages.find((p) => p.id === b.packageId)
  const lines: ReceiptLine[] = []
  let people = 0
  for (const g of dest.guests) {
    const qty = b.guests[g.key] ?? 0
    if (!qty) continue
    people += qty
    const unitVnd = g.free || !pkg ? 0 : parseVndK(g.key === "adults" ? pkg.price : (pkg.childPrice ?? pkg.price))
    lines.push({ label: g.formLabel, qty, unitVnd, sumVnd: qty * unitVnd })
  }
  for (const e of dest.extras) {
    const qty = b.extras[e.key] ?? 0
    if (!qty) continue
    const unitVnd = parseVndK(e.price)
    lines.push({ label: e.label, qty, unitVnd, sumVnd: qty * unitVnd })
  }
  const district = b.district ? findDistrict(b.destination, b.district) : null
  return {
    lines,
    people,
    ticketsVnd: lines.reduce((a, l) => a + l.sumVnd, 0),
    transferUsd: district?.priceUsd ?? null,
    transferLabel: district?.label ?? null,
  }
}

/** 1150000 → "1 150 000 ₫" */
export function formatVnd(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ")} ₫`
}

/** Итог одной строкой: "1 150 000 ₫ + $30 трансфер" */
export function receiptTotalRu(r: Receipt): string {
  const parts = []
  if (r.ticketsVnd) parts.push(formatVnd(r.ticketsVnd))
  if (r.transferUsd) parts.push(`$${r.transferUsd} трансфер`)
  return parts.join(" + ") || "—"
}

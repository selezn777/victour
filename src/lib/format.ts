import { usdToRub, usdToVnd } from "@/lib/pricing"

export function formatUsd(usd: number): string {
  return `$${usd.toLocaleString("ru-RU")}`
}

export function formatVndFromUsd(usd: number, vndRate: number): string {
  return `${usdToVnd(usd, vndRate).toLocaleString("ru-RU")} ₫`
}

export function formatRubFromUsd(usd: number, rubRate: number, markupPct: number): string {
  return `${Math.round(usdToRub(usd, rubRate, markupPct)).toLocaleString("ru-RU")} ₽`
}

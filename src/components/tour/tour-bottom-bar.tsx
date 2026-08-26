"use client"

import { Button } from "@/components/ui/button"
import { formatUsd } from "@/lib/format"

// Сквозная нижняя плашка на странице тура — видна на ЛЮБОМ слайде колоды
// (не только у брони, как раньше была TourStickyCta): цена за человека +
// кнопка, ведёт к слайду брони. Гости/дата настраиваются на самом слайде
// брони (см. TourBookingSlide) — Виктор попросил вернуть их туда, отдельный
// степпер здесь оказался неудобным.
export function TourBottomBar({
  priceAdultUsd,
  ctaLabel,
  onCtaClick,
}: {
  priceAdultUsd: number
  ctaLabel: string
  onCtaClick: () => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div>
          <div className="text-xs text-muted-foreground">Цена за человека</div>
          <div className="font-heading text-lg font-semibold text-primary">
            {formatUsd(priceAdultUsd)}
          </div>
        </div>
        <Button type="button" size="lg" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}

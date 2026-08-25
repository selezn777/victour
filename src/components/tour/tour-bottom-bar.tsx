"use client"

import { Button } from "@/components/ui/button"
import { usePackage } from "@/hooks/use-package"
import { formatUsd } from "@/lib/format"

// Сквозная нижняя плашка на странице тура — видна на ЛЮБОМ слайде колоды
// (не только у брони, как раньше была TourStickyCta): цена за человека +
// кнопка. На слайде брони в неё же добавляется степпер гостей (Виктор:
// "пусть на календаре +/- тоже будет"), чтобы гость мог поменять число
// гостей не отрываясь от календаря — цена в этой же плашке сразу пересчитывается.
export function TourBottomBar({
  priceAdultUsd,
  ctaLabel,
  onCtaClick,
  showGuestStepper,
  guestCount,
  onGuestCountChange,
}: {
  priceAdultUsd: number
  ctaLabel: string
  onCtaClick: () => void
  showGuestStepper: boolean
  guestCount: number
  onGuestCountChange: (updater: (count: number) => number) => void
}) {
  // PackageBar ("N туров в заявке") тоже fixed bottom-0 — если гость уже
  // добавил тур с ДРУГОЙ страницы, она перекроет эту; в таком случае
  // прячемся, у гостя и так есть путь вперёд ("Перейти к заявке").
  const { items } = usePackage()
  if (items.length > 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          {showGuestStepper && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={guestCount <= 2}
                onClick={() => onGuestCountChange((c) => Math.max(2, c - 1))}
                aria-label="Меньше гостей"
              >
                −
              </Button>
              <span className="w-5 text-center text-sm font-medium">{guestCount}</span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={guestCount >= 9}
                onClick={() => onGuestCountChange((c) => Math.min(9, c + 1))}
                aria-label="Больше гостей"
              >
                +
              </Button>
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground">Цена за человека</div>
            <div className="font-heading text-lg font-semibold text-primary">
              {formatUsd(priceAdultUsd)}
            </div>
          </div>
        </div>
        <Button type="button" size="lg" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}

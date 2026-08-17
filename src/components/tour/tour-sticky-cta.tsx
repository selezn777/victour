"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { usePackage } from "@/hooks/use-package"
import { formatUsd } from "@/lib/format"

// Бронь стоит в середине потока страницы (после маршрута/что входит/цены,
// перед отзывами/вопросами) — стоило пролистать до отзывов, и кнопки
// "Добавить в заявку" уже не видно, приходится листать обратно наверх. Эта
// планка следит через IntersectionObserver, видна ли настоящая панель
// бронирования (targetId), и показывается вместо неё, пока её не видно —
// кнопка просто скроллит обратно к ней. Раньше была только на мобиле (на
// десктопе бронь висела sticky-сайдбаром сбоку) — теперь бронь встроена в
// общий поток на ВСЕХ размерах экрана, поэтому и планка работает везде.
export function TourStickyCta({
  priceAdultUsd,
  targetId,
}: {
  priceAdultUsd: number
  targetId: string
}) {
  const [panelVisible, setPanelVisible] = useState(true)
  // PackageBar (нижняя панель "N туров в заявке") тоже fixed bottom-0 — если гость уже
  // добавил тур с ДРУГОЙ страницы, она перекроет эту. В таком случае прячемся, у гостя
  // и так есть путь вперёд ("Перейти к заявке").
  const { items } = usePackage()

  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setPanelVisible(entry.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [targetId])

  if (items.length > 0) return null

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur transition-transform duration-300 ease-out supports-backdrop-filter:bg-card/80 ${
        panelVisible ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div>
          <div className="text-xs text-muted-foreground">Цена за человека</div>
          <div className="font-heading text-lg font-semibold text-primary">
            {formatUsd(priceAdultUsd)}
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() =>
            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          Забронировать
        </Button>
      </div>
    </div>
  )
}

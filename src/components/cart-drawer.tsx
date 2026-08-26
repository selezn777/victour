"use client"

import Link from "next/link"
import { ShoppingBagIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { isConfigured, usePackage } from "@/hooks/use-package"
import { formatUsd } from "@/lib/format"

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })
}

// Раньше добавленные в заявку туры показывала фиксированная плашка внизу
// экрана (PackageBar) — Виктор увидел её на странице тура (там уже есть
// своя нижняя плашка цены) и попросил убрать: "смотрится плохо", вместо
// неё — иконка корзины СЛЕВА от "ВикТур" в шапке, открывающая список.
// Донастройка (дата/гости по каждому туру, доплаты, форма) остаётся на
// /request — там это уже полноценно сделано; здесь только быстрый обзор +
// удаление позиции, чтобы не дублировать календарь внутри шторки.
export function CartDrawer() {
  const { items, removeItem } = usePackage()

  if (items.length === 0) return null

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`Заявка: ${items.length} тур(а)`} />}
      >
        <span className="relative">
          <ShoppingBagIcon />
          <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {items.length}
          </span>
        </span>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="font-heading text-lg tracking-[0.02em]">Ваша заявка</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4">
          {items.map((item) => (
            <div
              key={item.tourSlug}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div>
                <div className="text-sm font-medium">{item.tourTitle}</div>
                {isConfigured(item) ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(item.date!)} · {item.adults} гостей · {formatUsd((item.priceAdultUsd ?? 0) * (item.adults ?? 0))}
                  </div>
                ) : (
                  <div className="mt-0.5 text-xs text-muted-foreground">Дата и гости не выбраны</div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Убрать тур из заявки"
                onClick={() => removeItem(item.tourSlug)}
              >
                <XIcon />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-border p-4">
          <Button size="lg" className="w-full" nativeButton={false} render={<Link href="/request" />}>
            Перейти к заявке
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

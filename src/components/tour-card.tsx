"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatUsd } from "@/lib/format"
import { usePackage } from "@/hooks/use-package"
import type { CatalogTour } from "@/lib/site-data"

export function TourCard({
  tour,
  fill,
}: {
  tour: CatalogTour
  /** Заполнить родителя целиком вместо фиксированного aspect-3/4 — для
   * использования внутри слайда с уже заданной высотой (см. TourCatalog). */
  fill?: boolean
}) {
  // Раньше тут было "избранное" — Виктор попросил заменить на быстрое
  // добавление в заявку прямо из каталога: можно за пару тапов набрать
  // 2-3 тура, а дату/гостей донастроить потом на странице заявки.
  const { items, addPendingTour, removeItem } = usePackage()
  const inPackage = items.some((i) => i.tourSlug === tour.slug)
  const atLimit = items.length >= 4 && !inPackage

  function toggle() {
    if (inPackage) {
      removeItem(tour.slug)
    } else if (!atLimit) {
      addPendingTour({ tourId: tour.id, tourSlug: tour.slug, tourTitle: tour.title })
    }
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden bg-muted",
        fill ? "h-full w-full" : "aspect-3/4 rounded-2xl",
      )}
    >
      <Link href={`/tours/${tour.slug}`} className="absolute inset-0">
        {/* Один статичный кадр — Виктор попросил убрать внутреннюю карусель
            фото на карточке совсем ("переключение убираем"), сам выберет,
            какое единственное фото ставить на каждый тур. */}
        {tour.heroImageUrl && (
          <Image
            src={tour.heroImageUrl}
            alt={tour.title}
            fill
            priority
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        {/* На весь экран (fill) — затемнение мягче: Виктор попросил убрать
            почти совсем, но оставить чуть-чуть для контраста текста. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 bg-gradient-to-t to-transparent",
            fill ? "from-black/70 via-black/5" : "from-black/95 via-black/20",
          )}
        />

        {/* На весь экран (fill) — отступ снизу увеличен: под карточкой теперь
            горизонтальный ряд точек-переключателя между турами, текст не
            должен на него наезжать. */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 px-5 pt-5 text-white",
            fill ? "pb-14" : "pb-6",
          )}
        >
          <span className="text-xs tracking-wide text-white/70 uppercase">
            {tour.durationLabel}
          </span>
          <h3
            className={cn(
              "font-heading leading-tight font-semibold",
              fill ? "text-3xl" : "text-2xl",
            )}
          >
            {tour.title}
          </h3>
          {/* На весь экран (fill) — без обрезки, Виктор хотел видеть описание
              полностью, не line-clamp-2 как в компактной сетке. */}
          <p className={cn("text-white/80", fill ? "text-base" : "line-clamp-2 text-sm")}>
            {tour.shortDescription}
          </p>

          <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="text-base font-medium text-primary">
              от {formatUsd(tour.priceFromUsd)} / чел
            </span>
            <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-opacity group-hover:opacity-90">
              Программа тура
            </span>
          </div>
        </div>
      </Link>

      <Button
        variant="secondary"
        size="icon-sm"
        aria-label={inPackage ? "Убрать тур из заявки" : "Добавить тур в заявку"}
        aria-pressed={inPackage}
        disabled={atLimit}
        onClick={toggle}
        className={cn(
          "absolute top-3 right-3 z-10 backdrop-blur-sm",
          inPackage ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-background/70 hover:bg-background",
        )}
      >
        {inPackage ? <CheckIcon /> : <PlusIcon />}
      </Button>
    </article>
  )
}

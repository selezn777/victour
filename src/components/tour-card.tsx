"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckIcon } from "lucide-react"
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
  // Раньше тут было быстрое добавление в заявку прямо из каталога (тур
  // без даты, донастройка потом) — Виктор убрал: добавить в заявку теперь
  // можно только со страницы тура, с обязательной датой. Галочка тут —
  // ЧИСТЫЙ статус "уже в заявке", не кнопка: Виктор — "если на неё
  // нажать, она пропадает, а не должна, она не связана с добавлением
  // тура" — убрать из заявки теперь можно только на /request.
  const { items } = usePackage()
  const inPackage = items.some((i) => i.tourSlug === tour.slug)

  return (
    <article
      className={cn(
        "group relative overflow-hidden bg-muted",
        fill ? "h-full w-full" : "aspect-3/4 rounded-2xl",
      )}
    >
      {/* Виктор: раньше вся карточка была одной большой ссылкой — тур
          "неприемлемо" открывался тапом в любом месте карточки. Теперь тур
          открывается ТОЛЬКО по кнопке "Программа тура" ниже — тут обычный
          div, а не Link. */}
      <div className="absolute inset-0">
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
            fill ? "pb-20" : "pb-6",
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
            {/* Виктор: была мелкая обводка-пилюля, просил крупнее и
                "серебристо" — заметная кнопка с нажимаемым эффектом
                (active:scale), единственный тап-таргет, ведущий на тур.
                Потом ещё раз попросил "ещё больше" — увеличил паддинги и
                шрифт дальше (px-4→px-6, py-2→py-3, text-sm→text-base). */}
            <Link
              href={`/tours/${tour.slug}`}
              className="rounded-full bg-gradient-to-b from-white to-zinc-300 px-6 py-3 text-base font-semibold text-zinc-900 shadow-sm transition-transform duration-150 active:scale-95"
            >
              Программа тура
            </Link>
          </div>
        </div>
      </div>

      {inPackage && (
        <div
          role="status"
          aria-label="Тур уже в заявке"
          className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground backdrop-blur-sm"
        >
          <CheckIcon className="size-4" />
        </div>
      )}
    </article>
  )
}

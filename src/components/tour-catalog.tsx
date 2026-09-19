"use client"

import { useRef } from "react"
import type { Swiper as SwiperType } from "swiper/types"
import { TourCard } from "@/components/tour-card"
import { SlideDeck } from "@/components/slide-deck"
import type { CatalogTour } from "@/lib/site-data"

const STORAGE_KEY = "tour-catalog:index"

export function TourCatalog({ tours }: { tours: CatalogTour[] }) {
  const swiperRef = useRef<SwiperType | null>(null)

  if (tours.length === 0) return null

  return (
    // Ни заголовка, ни поиска/избранного, ни боковых отступов, ни
    // ограничения ширины — Виктор явно сказал "это не во весь экран":
    // карточка должна быть впритык под хедером и во всю ширину экрана,
    // без полей по бокам. Высота — var(--site-header-h) (реальная высота
    // SiteHeader, измеренная ResizeObserver'ом там же — см. комментарий в
    // slide-deck.tsx, тот же приём вместо hardcoded rem) — dvh, не svh, см.
    // комментарий в slide-deck.tsx про прижатый к верху контент на
    // реальных телефонах. Переключение между турами — вбок (не вниз, как
    // на главной): переплёт снизу горизонтальным рядом точек, а не сверху
    // слева книжным столбиком.
    //
    // Виктор: "тот тур, который смотрел последним в выборе туров — там
    // всегда нужно возвращаться на тот тур, который изучали последним" —
    // в отличие от страницы самого тура (см. tour-page-client.tsx), тут
    // восстановление ВСЕГДА, а не только при возврате назад: это каталог
    // карточек-превью, а не многослайдовая страница с собственной
    // вложенной навигацией, потерять место в нём при любом возврате сюда
    // (с главной, из тура, откуда угодно) одинаково нежелательно.
    <section id="catalog">
      <SlideDeck
        className="h-[calc(100dvh-var(--site-header-h))] w-full"
        direction="horizontal"
        paginationPosition="bottom-center"
        onSwiper={(swiper) => {
          swiperRef.current = swiper
          const saved = sessionStorage.getItem(STORAGE_KEY)
          if (saved != null) {
            swiper.slideTo(Number(saved), 0)
          }
        }}
        onSlideChange={(index) => {
          sessionStorage.setItem(STORAGE_KEY, String(index))
        }}
        slides={tours.map((tour) => (
          <TourCard key={tour.slug} tour={tour} fill />
        ))}
      />
    </section>
  )
}

"use client"

import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Mousewheel, Pagination, Keyboard } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper/types"
import type { ReactNode } from "react"

import "swiper/css"
import "swiper/css/pagination"

/**
 * Полноэкранные слайды с жёсткой блокировкой "ровно один за раз" — колесо,
 * тач-свайп и клавиатура листают строго по одному слайду, без проскакивания.
 * На первом/последнем слайде дальнейший скролл в ту же сторону отпускает
 * управление обычному скроллу страницы (releaseOnEdges). Точки и счётчик
 * справа показывают прогресс — сколько слайдов и где ты сейчас.
 */
export function SlideDeck({ slides }: { slides: ReactNode[] }) {
  const [active, setActive] = useState(0)

  return (
    <Swiper
      modules={[Mousewheel, Pagination, Keyboard]}
      direction="vertical"
      speed={420}
      mousewheel={{ releaseOnEdges: true, sensitivity: 1 }}
      keyboard={{ enabled: true }}
      pagination={{ clickable: true, el: ".slide-deck-pagination" }}
      onSlideChange={(swiper: SwiperType) => setActive(swiper.activeIndex)}
      className="h-[calc(100svh-3.5rem)] w-full sm:h-[calc(100svh-4rem)]"
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i} className="h-full w-full">
          {slide}
        </SwiperSlide>
      ))}
      <div className="pointer-events-none absolute top-1/2 right-4 z-20 flex -translate-y-1/2 flex-col items-center gap-3 sm:right-6">
        <div className="slide-deck-pagination pointer-events-auto flex flex-col items-center gap-2.5" />
        <span className="font-mono text-[11px] tabular-nums text-white/60">
          {active + 1}/{slides.length}
        </span>
      </div>
    </Swiper>
  )
}

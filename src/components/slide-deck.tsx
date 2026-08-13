"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Mousewheel, Pagination, Keyboard } from "swiper/modules"
import type { ReactNode } from "react"

import "swiper/css"
import "swiper/css/pagination"

/**
 * Полноэкранные слайды с жёсткой блокировкой "ровно один за раз" — колесо,
 * тач-свайп и клавиатура листают строго по одному слайду, без проскакивания.
 * На первом/последнем слайде дальнейший скролл в ту же сторону отпускает
 * управление обычному скроллу страницы (releaseOnEdges). Тонкая полоска
 * точек сверху показывает прогресс, не перетягивая внимание с фото/текста.
 */
export function SlideDeck({ slides }: { slides: ReactNode[] }) {
  return (
    <Swiper
      modules={[Mousewheel, Pagination, Keyboard]}
      direction="vertical"
      speed={420}
      mousewheel={{ releaseOnEdges: true, sensitivity: 1 }}
      keyboard={{ enabled: true }}
      pagination={{ clickable: true, el: ".slide-deck-pagination" }}
      className="h-[calc(100svh-3.5rem)] w-full sm:h-[calc(100svh-4rem)]"
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i} className="h-full w-full">
          {slide}
        </SwiperSlide>
      ))}
      <div className="pointer-events-none absolute top-2.5 left-1/2 z-20 -translate-x-1/2 sm:top-3.5">
        <div className="slide-deck-pagination pointer-events-auto flex items-center gap-1.5" />
      </div>
    </Swiper>
  )
}

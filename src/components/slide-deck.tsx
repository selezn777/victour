"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Mousewheel, Pagination, Keyboard } from "swiper/modules"
import type { ReactNode } from "react"
import type { Swiper as SwiperType } from "swiper/types"

import "swiper/css"
import "swiper/css/pagination"

/**
 * Полноэкранные слайды с жёсткой блокировкой "ровно один за раз" — колесо,
 * тач-свайп и клавиатура листают строго по одному слайду, без проскакивания.
 * На первом/последнем слайде дальнейший скролл в ту же сторону отпускает
 * управление обычному скроллу страницы (releaseOnEdges). Вертикальная колонка
 * стежков-делений слева сверху, поверх зоны фото у каждого слайда (никогда не
 * заходит в текстовую зону), показывает прогресс — стилизована под переплёт книги.
 *
 * onSwiper — опциональный доступ к инстансу Swiper для программных переходов
 * (например кнопка "Забронировать" в одном слайде уводит на слайд брони).
 */
export function SlideDeck({ slides, onSwiper }: { slides: ReactNode[]; onSwiper?: (swiper: SwiperType) => void }) {
  return (
    <Swiper
      modules={[Mousewheel, Pagination, Keyboard]}
      direction="vertical"
      speed={420}
      mousewheel={{ releaseOnEdges: true, sensitivity: 1 }}
      keyboard={{ enabled: true }}
      pagination={{ clickable: true, el: ".slide-deck-pagination" }}
      onSwiper={onSwiper}
      className="h-[calc(100svh-3.5rem)] w-full sm:h-[calc(100svh-4rem)]"
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i} className="h-full w-full">
          {slide}
        </SwiperSlide>
      ))}
      <div className="pointer-events-none absolute top-4 left-3 z-20 sm:top-5 sm:left-5">
        <div className="slide-deck-pagination pointer-events-auto flex flex-col items-center gap-2" />
      </div>
    </Swiper>
  )
}

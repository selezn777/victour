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
 * управление обычному скроллу страницы (releaseOnEdges). Вертикальная колонка
 * стежков-делений слева сверху, поверх зоны фото у каждого слайда (никогда не
 * заходит в текстовую зону), показывает прогресс — стилизована под переплёт книги.
 */
export function SlideDeck({
  slides,
  className = "h-[calc(100svh-3.5rem)] w-full sm:h-[calc(100svh-4rem)]",
}: {
  slides: ReactNode[]
  /** Переопределяет высоту/ширину — по умолчанию "вся высота вьюпорта минус
   * хедер" (как на главной). Задать явную высоту, если дека встроена НЕ
   * первым блоком под хедером, а ниже другого контента на странице. */
  className?: string
}) {
  return (
    <Swiper
      modules={[Mousewheel, Pagination, Keyboard]}
      direction="vertical"
      speed={420}
      mousewheel={{ releaseOnEdges: true, sensitivity: 1 }}
      keyboard={{ enabled: true }}
      pagination={{ clickable: true, el: ".slide-deck-pagination" }}
      className={className}
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

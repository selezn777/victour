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
const PAGINATION_WRAPPER_CLASS = {
  "top-left": "pointer-events-none absolute top-4 left-3 z-20 sm:top-5 sm:left-5",
  "bottom-center": "pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center sm:bottom-5",
}

const PAGINATION_DOTS_CLASS = {
  "top-left": "flex flex-col items-center gap-2",
  // Swiper сам добавляет класс swiper-pagination-horizontal, у которого в
  // его собственном CSS зашита ширина 100% — без !w-fit ряд точек
  // растягивался на всю ширину экрана вместо компактной кучки по центру.
  // pagination-flat-h — та же плоская чёрточка-эстетика, что и у "переплёта"
  // слева, но без вертикальной линии-стежка (она осмысленна только вдоль
  // вертикального ряда) и с ростом ШИРИНЫ у активной точки, а не высоты.
  "bottom-center": "flex! w-fit! flex-row items-center gap-2 pagination-flat-h",
}

export function SlideDeck({
  slides,
  className = "h-[calc(100svh-3.5rem)] w-full sm:h-[calc(100svh-4rem)]",
  direction = "vertical",
  paginationPosition = "top-left",
}: {
  slides: ReactNode[]
  /** Переопределяет высоту/ширину — по умолчанию "вся высота вьюпорта минус
   * хедер" (как на главной). Задать явную высоту, если дека встроена НЕ
   * первым блоком под хедером, а ниже другого контента на странице. */
  className?: string
  /** По умолчанию вертикальная (как на главной). */
  direction?: "vertical" | "horizontal"
  /** "bottom-center" — горизонтальный ряд точек снизу по центру, для
   * горизонтальной деки (переключение вбок). "none" — без индикатора вообще
   * (Виктор попросил убрать "переплёт" на главной — он визуально сдвигал
   * контент влево, раз он был только слева, а не с обеих сторон). */
  paginationPosition?: "top-left" | "bottom-center" | "none"
}) {
  return (
    <Swiper
      modules={[Mousewheel, Pagination, Keyboard]}
      direction={direction}
      speed={420}
      mousewheel={{ releaseOnEdges: true, sensitivity: 1 }}
      keyboard={{ enabled: true }}
      pagination={paginationPosition === "none" ? false : { clickable: true, el: ".slide-deck-pagination" }}
      // У горизонтальной деки Swiper по умолчанию ставит touch-action: pan-y
      // (пропускает вертикальный тач-жест браузеру) — вертикальный свайп по
      // /tours не листал слайды, а скроллил страницу и схлопывал адресную
      // строку браузера ("весь сайт съезжает наверх"). touch-pan-x запрещает
      // вертикальный пан у самого элемента — жест целиком достаётся Swiper.
      className={direction === "horizontal" ? `${className} touch-pan-x!` : className}
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i} className="h-full w-full">
          {slide}
        </SwiperSlide>
      ))}
      {paginationPosition !== "none" && (
        <div className={PAGINATION_WRAPPER_CLASS[paginationPosition]}>
          <div className={`slide-deck-pagination pointer-events-auto ${PAGINATION_DOTS_CLASS[paginationPosition]}`} />
        </div>
      )}
    </Swiper>
  )
}

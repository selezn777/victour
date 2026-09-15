"use client"

import { useRef, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper/types"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { TourDetail } from "@/lib/site-data"
import { PinchZoomPhoto } from "@/components/pinch-zoom-photo"

import "swiper/css"
import "swiper/css/pagination"

// Первый слайд колоды тура — фото-карусель во всю ширину (без скруглений,
// не в колонке max-w-3xl, как раньше была TourPhotoGallery), но НЕ во всю
// высоту слайда (не фон): зона фото ограничена сверху, снизу — заголовок и
// описание. min-h-0 flex-1 — фото забирает весь остаток высоты после
// текста (у текста естественный размер, приоритет) — тот же приём, что у
// PhotoSlide на главной (advantages-section.tsx), без magic numbers
// (раньше тут был фиксированный % + svh-потолок, подобранный вручную под
// конкретные экраны — неустойчиво на других размерах).
export function TourPhotoSlide({ tour }: { tour: TourDetail }) {
  const [active, setActive] = useState(0)
  const swiperRef = useRef<SwiperType | null>(null)
  const photos = tour.galleryUrls.length > 0 ? tour.galleryUrls : tour.heroImageUrl ? [tour.heroImageUrl] : []

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {photos.length > 0 ? (
        // Виктор: "фотки на первом слайде огромные, почти на весь экран,
        // внизу описание такое же как сейчас, чтобы не было свободного
        // места" — фото теперь забирает весь остаток после текста; в
        // отличие от PhotoSlide на главной (advantages-section.tsx), тут
        // нет TourCtaButton под текстом, текст короче — фото стабильно
        // получает больше места, без ручной подстройки под конкретный %.
        <div className="relative min-h-0 flex-1">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".tour-photo-slide-pagination" }}
            onSwiper={(swiper: SwiperType) => (swiperRef.current = swiper)}
            onSlideChange={(swiper: SwiperType) => setActive(swiper.activeIndex)}
            allowTouchMove={false}
            className="h-full w-full"
          >
            {photos.map((url, i) => (
              <SwiperSlide key={url} className="relative h-full w-full">
                <PinchZoomPhoto src={url} alt={`${tour.title}, фото ${i + 1}`} priority={i === 0} />
              </SwiperSlide>
            ))}
          </Swiper>
          {photos.length > 1 && (
            <>
              {/* Виктор: "убираем свайп, добавляем аккуратные стрелочки по
                  бокам" — листание теперь только кнопками. */}
              <button
                type="button"
                aria-label="Предыдущее фото"
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-4 sm:p-2"
              >
                <ChevronLeftIcon className="size-4 sm:size-5" />
              </button>
              <button
                type="button"
                aria-label="Следующее фото"
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-4 sm:p-2"
              >
                <ChevronRightIcon className="size-4 sm:size-5" />
              </button>
              {/* Виктор: тёмная плашка-полоска под точками — убрать везде, точки
                  и счётчик лежат прямо на фото (drop-shadow вместо плашки для
                  читаемости на светлых фото). Счётчик с точками — по центру. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:bottom-6">
                <div className="tour-photo-slide-pagination pointer-events-auto flex w-auto! items-center gap-1.5" />
                <span className="font-mono text-xs tabular-nums text-white">
                  {active + 1}/{photos.length}
                </span>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* flex-1 только когда фото нет вообще (photos.length === 0) — тогда
          текст остаётся единственным ребёнком и должен сам заполнить всю
          высоту слайда (как раньше). Когда фото есть, весь остаток забирает
          ОНО (см. min-h-0 flex-1 выше), текст — своего естественного
          размера. */}
      <div
        className={`flex min-h-0 flex-col items-center justify-[safe_center] overflow-y-auto px-4 pt-4 pb-5 text-center sm:px-11 sm:pt-7 ${
          photos.length === 0 ? "flex-1" : ""
        }`}
      >
        <span className="text-xs font-medium tracking-widest text-primary uppercase">{tour.durationLabel}</span>
        <h1 className="mt-2 max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {tour.title}
        </h1>
        <p className="mt-2 max-w-xl text-base leading-snug text-muted-foreground sm:mt-3 sm:text-xl">
          {tour.shortDescription}
        </p>
      </div>
    </div>
  )
}

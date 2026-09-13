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
// описание, тот же приём высотного бюджета, что у PhotoSlide на главной
// (advantages-section.tsx) — min(%, Nsvh), чтобы текст не уезжал за экран
// на низких широких окнах.
export function TourPhotoSlide({ tour }: { tour: TourDetail }) {
  const [active, setActive] = useState(0)
  const swiperRef = useRef<SwiperType | null>(null)
  const photos = tour.galleryUrls.length > 0 ? tour.galleryUrls : tour.heroImageUrl ? [tour.heroImageUrl] : []

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {photos.length > 0 ? (
        // Виктор: "фотки на первом слайде огромные, почти на весь экран,
        // внизу описание такое же как сейчас, чтобы не было свободного
        // места" — бюджет фото сильно увеличен (было 52%/42svh/38svh); тут,
        // в отличие от PhotoSlide на главной (advantages-section.tsx), нет
        // TourCtaButton под текстом, поджимать место под кнопку не нужно.
        <div className="relative h-[64%] shrink-0 sm:h-[min(60%,50svh)] lg:h-[min(56%,46svh)]">
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

      <div className="flex flex-1 flex-col items-center justify-[safe_center] overflow-y-auto px-4 pt-4 pb-5 text-center sm:px-11 sm:pt-7">
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

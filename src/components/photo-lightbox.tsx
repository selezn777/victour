"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Keyboard, Zoom } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper/types"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { variantUrl } from "@/lib/image-variant-url"

import "swiper/css"
import "swiper/css/zoom"

// Полноэкранный просмотр фото тура (Виктор 2026-11-13: «как в фейсбуке» - тап по
// фото открывает карусель, листать, приближать щипком или двойным тапом, закрыть
// крестиком или кнопкой «назад» телефона; после закрытия в карусели тура то же фото).
// Кнопка «назад»: при открытии кладём запись в history, popstate закрывает просмотр,
// а закрытие крестиком снимает эту запись, чтобы «назад» потом не съедался.
export function PhotoLightbox({
  photos,
  alt,
  startIndex,
  onClose,
}: {
  photos: string[]
  alt: string
  startIndex: number
  onClose: (index: number) => void
}) {
  const [index, setIndex] = useState(startIndex)
  const indexRef = useRef(startIndex)
  const swiperRef = useRef<SwiperType | null>(null)
  const closedRef = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const n = photos.length
  // Грузим текущее фото и соседей; показанные остаются, чтобы не мигали.
  const [loaded, setLoaded] = useState(() => new Set([startIndex, (startIndex + 1) % n, (startIndex - 1 + n) % n]))
  if (![index, (index + 1) % n, (index - 1 + n) % n].every((i) => loaded.has(i))) {
    setLoaded(new Set([...loaded, index, (index + 1) % n, (index - 1 + n) % n]))
  }

  const finish = () => {
    if (closedRef.current) return
    closedRef.current = true
    onCloseRef.current(indexRef.current)
  }

  // Закрытие крестиком / Esc: снимаем свою запись истории, popstate сам вызовет finish.
  const requestClose = () => {
    if (window.history.state?.photoLightbox) window.history.back()
    else finish()
  }

  useEffect(() => {
    // Проверка флага - чтобы двойной запуск эффекта (StrictMode в dev) не положил две записи.
    if (!window.history.state?.photoLightbox) {
      window.history.pushState({ ...(window.history.state ?? {}), photoLightbox: true }, "")
    }
    const onPop = () => finish()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose()
    window.addEventListener("popstate", onPop)
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("popstate", onPop)
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фото"
      className="fixed inset-0 z-[200] flex flex-col bg-black"
    >
      <Swiper
        modules={[Zoom, Keyboard]}
        zoom={{ maxRatio: 4, toggle: true }}
        keyboard={{ enabled: true }}
        loop={n > 1}
        initialSlide={startIndex}
        spaceBetween={16}
        onSwiper={(s: SwiperType) => (swiperRef.current = s)}
        onSlideChange={(s: SwiperType) => {
          indexRef.current = s.realIndex
          setIndex(s.realIndex)
        }}
        className="h-full w-full"
      >
        {photos.map((url, i) => (
          <SwiperSlide key={url} className="flex! items-center justify-center">
            <div className="swiper-zoom-container">
              {loaded.has(i) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={variantUrl(url, 1600) ?? url}
                  alt={`${alt}, фото ${i + 1}`}
                  className="max-h-full max-w-full object-contain select-none"
                  draggable={false}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-6 sm:px-5">
        <span className="font-mono text-sm tabular-nums text-white">
          {index + 1}/{n}
        </span>
        <button
          type="button"
          aria-label="Закрыть"
          onClick={requestClose}
          className="pointer-events-auto rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/25"
        >
          <XIcon className="size-6" />
        </button>
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Предыдущее фото"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute top-1/2 left-2 z-10 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur-sm transition hover:bg-white/25 sm:block"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Следующее фото"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur-sm transition hover:bg-white/25 sm:block"
          >
            <ChevronRightIcon className="size-6" />
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}

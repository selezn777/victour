"use client"

import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog"
import { PinchZoomPhoto } from "@/components/pinch-zoom-photo"

import "swiper/css"
import "swiper/css/pagination"

// Виктор: на слайде "Маршрут" каждая локация должна открывать доп.
// страницу с её фото (большую часть экрана) и коротким описанием, с
// кнопкой назад. Тот же приём, что уже был у GuideProfileSheet (попап
// поверх текущего слайда колоды вместо перехода на отдельный урл — деку
// со стейтом брони это бы сбросило), но контент — фото-карусель в стиле
// первого слайда тура (TourPhotoSlide), а не аватар+био.
//
// Виктор: изначально был bottom-sheet (прижат к низу), потом добавил
// свою кастомную кнопку-крестик поверх фото (плашка bg-black/25) — он
// явно попросил и то и другое убрать: "по центру, сука, по центру" и
// "огромный плюсик... хочу чтобы он был такой же как общий дизайн".
// Dialog/DialogContent (не Sheet) — по-настоящему центрированный попап
// (fixed top-1/2 left-1/2 translate), со штатной кнопкой закрытия из
// общего UI-кита, а не самодельной.
const SHOW_ARTICLE_LINK = false

// Виктор 2026-11-13: «не надо закрывает-открывает» - внутри попапа листаем
// весь маршрут подряд: стрелки по бокам названия, счётчик «N из M» на фото.
// Свайп листает только фото места; переход между местами свайпом убран
// (Виктор 13.11: путался с листанием фото).
export type LocationStop = {
  title: string
  description: string
  photos: string[]
  articleSlug?: string | null
}


export function LocationDetailSheet({
  stops,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: {
  stops: LocationStop[]
  index: number
  onIndexChange: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const stop = stops[index]
  const { title, description, photos, articleSlug } = stop
  const total = stops.length
  const hasPrev = index > 0
  const hasNext = index < total - 1
  const go = (d: number) => {
    const n = index + d
    if (n >= 0 && n < total) onIndexChange(n)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // flex flex-col — DialogContent по умолчанию grid (рассчитан на
        // заголовок/описание/футер), у нашей вёрстки (фото сверху + текст)
        // без явного flex контент схлопывался: текст переносился по
        // одной букве, а фото не получало размеров и не рендерилось.
        className="flex max-h-[88vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md"
        showCloseButton={false}
      >
        {/* Тот же штатный крестик, что и в DialogContent по умолчанию —
            только с z-10: у Swiper (карусель фото ниже) в его собственном
            CSS зашит z-index:1 на обёртке, дефолтный крестик без своего
            z-index (z-index:auto) оказывался под ним и был кликабелен, но
            невидим. */}
        {/* Виктор: "крестик надо сделать поярче" — явный белый цвет +
            тень для контраста на любом фото, вместо обычного (тусклого
            на светлых фото) текста по умолчанию. "Чуть побольше" — сама
            иконка size-5 (была дефолтная size-4 у icon-sm). */}
        <DialogClose
          data-slot="dialog-close"
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-2 right-2 z-10 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] hover:bg-black/20 hover:text-white"
            />
          }
        >
          <XIcon className="size-5" />
          <span className="sr-only">Закрыть</span>
        </DialogClose>

        <div className="relative h-[42vh] w-full shrink-0 bg-muted sm:h-[46vh]">
          <Swiper
            key={index}
            modules={[Pagination]}
            rewind
            pagination={{ clickable: true, el: ".location-detail-pagination" }}
            className="h-full w-full"
          >
            {photos.map((url, i) => (
              <SwiperSlide key={url} className="relative h-full w-full">
                <PinchZoomPhoto src={url} alt={`${title}, фото ${i + 1}`} priority={i === 0} />
              </SwiperSlide>
            ))}
          </Swiper>
          {total > 1 && (
            <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-md bg-black/45 px-2 py-1 text-xs font-semibold text-white">
              Место {index + 1} из {total}
            </div>
          )}
          {/* Виктор: тёмная плашка-полоска под точками — убрать везде. */}
          {photos.length > 1 && (
            <div className="pointer-events-none absolute right-4 bottom-4 z-10 flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              <div className="location-detail-pagination pointer-events-auto flex items-center gap-1.5" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-2 pt-4 pb-4 text-center sm:px-4">
          <div className="flex items-start gap-1">
            {total > 1 && (
              <button
                type="button"
                aria-label="Предыдущее место"
                disabled={!hasPrev}
                onClick={() => go(-1)}
                className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-25"
              >
                <ChevronLeftIcon className="size-6" />
              </button>
            )}
            <h3 className="min-w-0 flex-1 self-center font-heading text-xl leading-[1.15] font-semibold sm:text-2xl">{title}</h3>
            {total > 1 && (
              <button
                type="button"
                aria-label="Следующее место"
                disabled={!hasNext}
                onClick={() => go(1)}
                className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-25"
              >
                <ChevronRightIcon className="size-6" />
              </button>
            )}
          </div>
          {description && (
            <p className="mt-2 px-2 text-sm text-muted-foreground sm:px-4 sm:text-base">{description}</p>
          )}
        </div>
        {/* Виктор: обводка не смотрелась — сплошной акцентный цвет сайта
            (тот же зелёный, что у кнопки брони на TourBottomBar), во всю
            ширину и без полей, флашем к нижнему краю попапа (скругление
            даёт overflow-hidden у DialogContent, свой rounded не нужен). */}
        {/* Виктор 2026-11-06: кнопку "Читать статью" пока прячем, вернёмся к ней позже. */}
        {SHOW_ARTICLE_LINK && articleSlug && (
          <Button
            type="button"
            size="lg"
            className="w-full shrink-0 rounded-none"
            nativeButton={false}
            render={<Link href={`/blog/${articleSlug}`} />}
          >
            Читать статью об этом месте
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

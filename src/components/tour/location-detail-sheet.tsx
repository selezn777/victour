"use client"

import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog"

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
export function LocationDetailSheet({
  title,
  description,
  photos,
  articleSlug,
  open,
  onOpenChange,
}: {
  title: string
  description: string
  photos: string[]
  /** Когда задан — под описанием появляется ссылка на полную статью
   * (история + туристический рассказ) про эту локацию, см. /blog/[slug]. */
  articleSlug?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
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
        <DialogClose
          data-slot="dialog-close"
          render={<Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 z-10" />}
        >
          <XIcon />
          <span className="sr-only">Закрыть</span>
        </DialogClose>

        <div className="relative h-[42vh] w-full shrink-0 bg-muted sm:h-[46vh]">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".location-detail-pagination" }}
            className="h-full w-full"
          >
            {photos.map((url, i) => (
              <SwiperSlide key={url} className="relative h-full w-full">
                <Image
                  src={url}
                  alt={`${title}, фото ${i + 1}`}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Виктор: тёмная плашка-полоска под точками — убрать везде. */}
          {photos.length > 1 && (
            <div className="pointer-events-none absolute right-4 bottom-4 z-10 flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              <div className="location-detail-pagination pointer-events-auto flex items-center gap-1.5" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-4 pb-5 text-center sm:px-8">
          <h3 className="font-heading text-xl leading-[1.15] font-semibold sm:text-2xl">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
          )}
          {/* Виктор: "крестика достаточно" — убрал отдельную кнопку
              закрытия ("Вернуться к маршруту"), она дублировала крестик. */}
          {articleSlug && (
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              nativeButton={false}
              render={<Link href={`/blog/${articleSlug}`} />}
            >
              Читать статью об этом месте
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

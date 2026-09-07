"use client"

import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

import "swiper/css"
import "swiper/css/pagination"

// Виктор: на слайде "Маршрут" каждая локация должна открывать доп.
// страницу с её фото (большую часть экрана) и коротким описанием, с
// кнопкой назад. Тот же приём, что уже был у GuideProfileSheet (попап
// поверх текущего слайда колоды вместо перехода на отдельный урл — деку
// со стейтом брони это бы сбросило), но контент — фото-карусель в стиле
// первого слайда тура (TourPhotoSlide), а не аватар+био.
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="inset-x-0 bottom-0 mx-auto mb-3 max-h-[88vh] w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-2xl p-0 sm:mb-6 sm:w-full sm:max-w-md"
        // Виктор: крестик почти не видно на светлых фото — своя плашка
        // вместо дефолтной прозрачной кнопки из Sheet.
        showCloseButton={false}
      >
        <div className="relative h-[48vh] w-full shrink-0 bg-muted sm:h-[52vh]">
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
          {photos.length > 1 && (
            <div className="pointer-events-none absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 backdrop-blur-md">
              <div className="location-detail-pagination pointer-events-auto flex items-center gap-1.5" />
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Закрыть"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-10 rounded-full bg-black/25 text-white backdrop-blur-md hover:bg-black/40 hover:text-white"
          >
            <XIcon />
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-4 pb-5 text-center sm:px-8">
          <h3 className="font-heading text-xl leading-[1.15] font-semibold sm:text-2xl">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
          )}
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
          <Button type="button" className="mt-2 w-full" onClick={() => onOpenChange(false)}>
            Вернуться к маршруту
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

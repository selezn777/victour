"use client"

import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
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
  open,
  onOpenChange,
}: {
  title: string
  description: string
  photos: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] gap-0 overflow-hidden rounded-t-2xl p-0">
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
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-4 pb-5 text-center sm:px-8">
          <h3 className="font-heading text-xl leading-[1.15] font-semibold sm:text-2xl">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
          )}
          <Button type="button" className="mt-5 w-full" onClick={() => onOpenChange(false)}>
            Вернуться к маршруту
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

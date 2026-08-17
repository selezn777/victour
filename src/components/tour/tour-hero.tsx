import type { TourDetail } from "@/lib/site-data"

// Только текст (длительность/заголовок/описание) — фото-карусель переехала
// ниже, после блока "Что входит"/"Не входит" (см. TourPhotoGallery),
// Виктор попросил такой порядок чтения.
export function TourHero({ tour }: { tour: TourDetail }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-2 text-center sm:px-6 sm:pt-8">
      <span className="text-xs font-medium tracking-widest text-primary uppercase">{tour.durationLabel}</span>
      <h1 className="mt-2 font-heading text-3xl leading-tight font-semibold sm:text-5xl">
        {tour.title}
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
        {tour.shortDescription}
      </p>
    </div>
  )
}

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

export function CuratedSection() {
  return (
    <Reveal y={0} className="relative h-[78vh] min-h-[460px] w-full overflow-hidden sm:h-[86vh]">
      <Image
        src="https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/nyachang-avtorskiy-b2ZHevFPr4gfLIEw3aV2oZPHvsRbs9.jpg"
        alt="Золотая пагода в Нячанге — один из пяти отобранных маршрутов"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl px-5 pb-12 text-center sm:px-10 sm:pb-20">
        <span className="text-xs font-medium tracking-wide text-primary uppercase">Отбор</span>
        <h3 className="mt-2 font-heading text-3xl leading-tight font-semibold text-white sm:text-5xl">
          Пять туров, а не тридцать пять
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          Могли бы предложить маршрут на любой вкус и бюджет. Вместо этого — всего пять, и за каждым личная
          проверка: безопасный транспорт, продуманный комфорт, программа без лишней спешки. Никакого конвейера —
          так проще ручаться, что поездка получится хорошей.
        </p>
        <Button
          size="lg"
          className="mt-6"
          nativeButton={false}
          render={<Link href="/tours" />}
        >
          Смотреть туры
        </Button>
      </div>
    </Reveal>
  )
}

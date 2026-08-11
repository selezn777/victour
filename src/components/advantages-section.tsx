import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { Glow } from "@/components/glow"

function CatalogCta() {
  return (
    <div className="flex justify-center bg-background py-10">
      <Button size="lg" nativeButton={false} render={<Link href="/tours" />}>
        Выбрать тур
      </Button>
    </div>
  )
}

function PhotoBlock({
  n,
  eyebrow,
  title,
  body,
  imageSrc,
  imageAlt,
  imagePosition,
}: {
  n: number
  eyebrow: string
  title: string
  body: string
  imageSrc: string
  imageAlt: string
  imagePosition?: string
}) {
  return (
    <Reveal y={0} className="relative h-[78vh] min-h-[460px] w-full overflow-hidden sm:h-[86vh]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
      <span
        aria-hidden
        className="pointer-events-none absolute top-4 right-4 font-heading text-[6rem] leading-none font-bold text-white/10 select-none sm:top-8 sm:right-10 sm:text-[10rem]"
      >
        {String(n).padStart(2, "0")}
      </span>
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl px-5 pb-12 sm:px-10 sm:pb-20">
        <span className="text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</span>
        <h3 className="mt-2 font-heading text-3xl leading-tight font-semibold text-white sm:text-5xl">{title}</h3>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">{body}</p>
      </div>
    </Reveal>
  )
}

function QuoteBlock({
  n,
  eyebrow,
  title,
  body,
  quote,
  quoteAuthor,
}: {
  n: number
  eyebrow: string
  title: string
  body: string
  quote: string
  quoteAuthor: string
}) {
  return (
    <Reveal className="relative mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
      <Glow side="left" />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 -z-10 -translate-x-1/2 font-heading text-[9rem] leading-none font-bold text-white/[0.05] select-none sm:text-[13rem]"
      >
        {String(n).padStart(2, "0")}
      </span>
      <span className="relative text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</span>
      <h3 className="relative mt-2 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{title}</h3>
      <p className="relative mt-3 text-base text-muted-foreground">{body}</p>
      <blockquote className="relative mx-auto mt-6 max-w-md rounded-2xl border border-border bg-card p-6 text-left shadow-lg">
        <span aria-hidden className="font-heading text-5xl leading-none text-primary/30">
          “
        </span>
        <p className="-mt-3 text-sm text-foreground/90 italic">{quote}</p>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-sm">🙂</span>
          {quoteAuthor}
        </p>
      </blockquote>
    </Reveal>
  )
}

export function AdvantagesSection() {
  return (
    <section className="relative overflow-hidden">
      <PhotoBlock
        n={1}
        eyebrow="Транспорт"
        title="Забудьте, каким должен быть трансфер в отпуске"
        body="Кожаные кресла с массажем и кондиционер, который реально спасает от вьетнамской жары, а не просто гудит для вида. Обычно с дороги все приезжают помятыми и раздражёнными. Наши гости выходят из машины будто их только что подвезли до дома, а не через три часа тряски."
        imageSrc="/images/hero/premium-van-interior.jpg"
        imageAlt="Салон премиального минивэна с кожаными креслами"
        imagePosition="30% 50%"
      />

      <PhotoBlock
        n={2}
        eyebrow="Компания"
        title="Экскурсия для вас, а не для вас и пятнадцати незнакомцев"
        body="Никто не опаздывает к автобусу, никого не приходится ждать, ни с кем не нужно знакомиться через силу. Программа собрана под вашу компанию, и весь день принадлежит только вам."
        imageSrc="/images/tours/mayak-dai-lan.jpg"
        imageAlt="Пляж у маяка Дай Лань, где кроме вас почти никого нет"
      />

      <CatalogCta />

      <QuoteBlock
        n={3}
        eyebrow="Гид"
        title="Гид, который разговаривает с вами, а не в микрофон для группы"
        body="Виктор рассказывает лично вам, а не толпе через наушник. Заинтересовало — идём глубже. Не зацепило — двигаемся дальше. Никакой зазубренной методички, зато много живых историй и подходящего чувства юмора."
        quote="Внимательный, знающий и с отличным чувством юмора"
        quoteAuthor="Nikeshka Sunny, отзыв о туре в Далат"
      />

      <PhotoBlock
        n={4}
        eyebrow="Еда"
        title="Обед решаете вы, а не расписание тур-автобуса"
        body="Никаких столовых, куда возят всех подряд ровно в час дня. Захотелось уличной лепёшки с рынка — идём за ней. Захотелось кофе прямо с фермы, где его выращивают — едем на ферму. Решение всегда за вами."
        imageSrc="/images/tours/dalat-2-dnya.jpg"
        imageAlt="Далат, куда заезжаем по своему желанию, а не по расписанию тур-группы"
      />

      <CatalogCta />

      <PhotoBlock
        n={5}
        eyebrow="Темп"
        title="Идём в вашем темпе, а не по графику для галочки"
        body="Никакой обязательной остановки в лавке, где гиду капает процент с ваших покупок. Понравилось место — задерживаемся сколько хочется. Не зацепило — едем дальше. Маршрут подстраивается под вас, а не наоборот."
        imageSrc="/images/tours/severnye-ostrova.jpg"
        imageAlt="Северные острова, тихая бухта в стороне от туристических троп"
      />
    </section>
  )
}

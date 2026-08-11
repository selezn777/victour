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
  eyebrow,
  title,
  body,
  imageSrc,
  imageAlt,
  imagePosition,
}: {
  eyebrow: string
  title: string
  body: string
  imageSrc: string
  imageAlt: string
  imagePosition?: string
}) {
  return (
    <Reveal
      y={0}
      className="relative h-[78vh] min-h-[460px] w-full snap-start snap-always overflow-hidden sm:h-[86vh]"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl px-5 pb-12 sm:px-10 sm:pb-20">
        <span className="text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</span>
        <h3 className="mt-2 font-heading text-3xl leading-tight font-semibold text-white sm:text-5xl">{title}</h3>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">{body}</p>
      </div>
    </Reveal>
  )
}

function QuoteBlock({
  eyebrow,
  title,
  body,
  quote,
  quoteAuthor,
}: {
  eyebrow: string
  title: string
  body: string
  quote: string
  quoteAuthor: string
}) {
  return (
    <Reveal className="relative mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
      <Glow side="left" />
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
        eyebrow="Компания"
        title="Это ваш день, и в нём больше никого"
        body="Никто не опаздывает к автобусу и не тащит всех в дьюти-фри. Программа собрана под вашу компанию — от встречи в отеле до прощания вечером."
        imageSrc="/images/tours/mayak-dai-lan.jpg"
        imageAlt="Пляж у маяка Дай Лань, где кроме вас почти никого нет"
      />

      <CatalogCta />

      <QuoteBlock
        eyebrow="Гид"
        title="С вами говорит Виктор, а не заезженная методичка"
        body="Он ведёт лично вас: шутит там, где смешно, копает глубже там, где вам действительно интересно. Никакого текста наизусть — живой разговор всю дорогу."
        quote="Внимательный, знающий и с отличным чувством юмора"
        quoteAuthor="Nikeshka Sunny, отзыв о туре в Далат"
      />

      <PhotoBlock
        eyebrow="Еда"
        title="Проголодались — просто скажите"
        body="Никаких столовых по расписанию тур-группы. Уличная лепёшка с рынка, кофе прямо с фермы — куда захочется, туда и заедем."
        imageSrc="/images/tours/dalat-2-dnya.jpg"
        imageAlt="Далат, куда заезжаем по своему желанию, а не по расписанию тур-группы"
      />

      <CatalogCta />

      <PhotoBlock
        eyebrow="Темп"
        title="Спешить нас с вами точно не заставят"
        body="Никакой обязательной лавки, где гиду капает процент с ваших покупок. Понравилось место — сидим сколько хочется. Маршрут подстраивается под вас, а не наоборот."
        imageSrc="/images/tours/severnye-ostrova.jpg"
        imageAlt="Северные острова, тихая бухта в стороне от туристических троп"
      />
    </section>
  )
}

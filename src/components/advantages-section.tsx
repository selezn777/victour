import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

function CatalogCta() {
  return (
    <div className="flex justify-center py-2">
      <Button size="lg" nativeButton={false} render={<Link href="#catalog" />}>
        Выбрать тур
      </Button>
    </div>
  )
}

function BlockNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-10 -z-10 font-heading text-[9rem] leading-none font-bold text-white/[0.05] select-none sm:-top-16 sm:text-[13rem]"
    >
      {String(n).padStart(2, "0")}
    </span>
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
  reverse,
}: {
  n: number
  eyebrow: string
  title: string
  body: string
  imageSrc: string
  imageAlt: string
  imagePosition?: string
  reverse?: boolean
}) {
  return (
    <div
      className={`relative grid grid-cols-1 items-center gap-6 sm:grid-cols-2 sm:gap-10 ${reverse ? "sm:[&>*:first-child]:order-2" : ""}`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-white/10">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
          className="object-cover"
          sizes="(min-width: 640px) 480px, 100vw"
        />
      </div>
      <div className="relative">
        <BlockNumber n={n} />
        <span className="relative text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</span>
        <h3 className="relative mt-2 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{title}</h3>
        <p className="relative mt-3 text-base text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

function TextBlock({
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
  quote?: string
  quoteAuthor?: string
}) {
  return (
    <div className="relative mx-auto max-w-2xl text-center">
      <BlockNumber n={n} />
      <span className="relative text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</span>
      <h3 className="relative mt-2 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{title}</h3>
      <p className="relative mt-3 text-base text-muted-foreground">{body}</p>
      {quote && (
        <blockquote className="relative mx-auto mt-6 max-w-md rounded-2xl border border-border bg-card p-6 text-left shadow-lg">
          <span aria-hidden className="font-heading text-5xl leading-none text-primary/30">
            “
          </span>
          <p className="-mt-3 text-sm text-foreground/90 italic">{quote}</p>
          {quoteAuthor && (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-sm">🙂</span>
              {quoteAuthor}
            </p>
          )}
        </blockquote>
      )}
    </div>
  )
}

function Glow({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute -z-10 size-[36rem] rounded-full blur-[110px]", className)}
    />
  )
}

export function AdvantagesSection() {
  return (
    <section className="relative mx-auto max-w-5xl overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
      <Glow className="top-0 left-1/2 -translate-x-[70%] bg-primary/10" />
      <Glow className="top-[60%] right-0 translate-x-1/3 bg-primary/[0.07]" />
      <Glow className="bottom-0 left-0 -translate-x-1/3 bg-primary/[0.06]" />

      <div className="flex flex-col gap-16 sm:gap-24">
        <Reveal>
          <PhotoBlock
            n={1}
            eyebrow="Транспорт"
            title="Забудьте, каким должен быть трансфер в отпуске"
            body="Кожаные кресла с массажем и кондиционер, который реально спасает от вьетнамской жары, а не просто гудит для вида. Обычно с дороги все приезжают помятыми и раздражёнными. Наши гости выходят из машины будто их только что подвезли до дома, а не через три часа тряски."
            imageSrc="/images/hero/premium-van-interior.jpg"
            imageAlt="Салон премиального минивэна с кожаными креслами"
            imagePosition="30% 50%"
            reverse
          />
        </Reveal>

        <Reveal>
          <PhotoBlock
            n={2}
            eyebrow="Компания"
            title="Экскурсия для вас, а не для вас и пятнадцати незнакомцев"
            body="Никто не опаздывает к автобусу, никого не приходится ждать, ни с кем не нужно знакомиться через силу. Программа собрана под вашу компанию, и весь день принадлежит только вам."
            imageSrc="/images/tours/mayak-dai-lan.jpg"
            imageAlt="Пляж у маяка Дай Лань, где кроме вас почти никого нет"
          />
        </Reveal>

        <CatalogCta />

        <Reveal>
          <TextBlock
            n={3}
            eyebrow="Гид"
            title="Гид, который разговаривает с вами, а не в микрофон для группы"
            body="Виктор рассказывает лично вам, а не толпе через наушник. Заинтересовало — идём глубже. Не зацепило — двигаемся дальше. Никакой зазубренной методички, зато много живых историй и подходящего чувства юмора."
            quote="Внимательный, знающий и с отличным чувством юмора"
            quoteAuthor="Nikeshka Sunny, отзыв о туре в Далат"
          />
        </Reveal>

        <Reveal>
          <PhotoBlock
            n={4}
            eyebrow="Еда"
            title="Обед решаете вы, а не расписание тур-автобуса"
            body="Никаких столовых, куда возят всех подряд ровно в час дня. Захотелось уличной лепёшки с рынка — идём за ней. Захотелось кофе прямо с фермы, где его выращивают — едем на ферму. Решение всегда за вами."
            imageSrc="/images/tours/dalat-2-dnya.jpg"
            imageAlt="Далат, куда заезжаем по своему желанию, а не по расписанию тур-группы"
            reverse
          />
        </Reveal>

        <CatalogCta />

        <Reveal>
          <PhotoBlock
            n={5}
            eyebrow="Темп"
            title="Идём в вашем темпе, а не по графику для галочки"
            body="Никакой обязательной остановки в лавке, где гиду капает процент с ваших покупок. Понравилось место — задерживаемся сколько хочется. Не зацепило — едем дальше. Маршрут подстраивается под вас, а не наоборот."
            imageSrc="/images/tours/severnye-ostrova.jpg"
            imageAlt="Северные острова, тихая бухта в стороне от туристических троп"
          />
        </Reveal>
      </div>
    </section>
  )
}

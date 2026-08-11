import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

function CatalogCta() {
  return (
    <div className="flex justify-center py-2">
      <Button size="lg" nativeButton={false} render={<Link href="#catalog" />}>
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
  reverse,
}: {
  eyebrow: string
  title: string
  body: string
  imageSrc: string
  imageAlt: string
  reverse?: boolean
}) {
  return (
    <div
      className={`grid grid-cols-1 items-center gap-6 sm:grid-cols-2 sm:gap-10 ${reverse ? "sm:[&>*:first-child]:order-2" : ""}`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-muted shadow-sm">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" sizes="(min-width: 640px) 480px, 100vw" />
      </div>
      <div>
        <span className="text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</span>
        <h3 className="mt-2 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{title}</h3>
        <p className="mt-3 text-base text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

function TextBlock({
  eyebrow,
  title,
  body,
  quote,
  quoteAuthor,
}: {
  eyebrow: string
  title: string
  body: string
  quote?: string
  quoteAuthor?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</span>
      <h3 className="mt-2 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{title}</h3>
      <p className="mt-3 text-base text-muted-foreground">{body}</p>
      {quote && (
        <blockquote className="mx-auto mt-5 max-w-md rounded-2xl border border-border bg-card p-5 text-sm shadow-sm">
          <p className="text-foreground/90 italic">«{quote}»</p>
          {quoteAuthor && <p className="mt-2 text-xs text-muted-foreground">— {quoteAuthor}</p>}
        </blockquote>
      )}
    </div>
  )
}

export function AdvantagesSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-14 sm:gap-20">
        <Reveal>
          <TextBlock
            eyebrow="Транспорт"
            title="Забудьте, каким должен быть трансфер в отпуске"
            body="Кожаные кресла с массажем и кондиционер, который реально спасает от вьетнамской жары, а не просто гудит для вида. Обычно с дороги все приезжают помятыми и раздражёнными. Наши гости выходят из машины будто их только что подвезли до дома, а не через три часа тряски."
          />
        </Reveal>

        <Reveal>
          <PhotoBlock
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
            eyebrow="Гид"
            title="Гид, который разговаривает с вами, а не в микрофон для группы"
            body="Виктор рассказывает лично вам, а не толпе через наушник. Заинтересовало — идём глубже. Не зацепило — двигаемся дальше. Никакой зазубренной методички, зато много живых историй и подходящего чувства юмора."
            quote="Внимательный, знающий и с отличным чувством юмора"
            quoteAuthor="Nikeshka Sunny, отзыв о туре в Далат"
          />
        </Reveal>

        <Reveal>
          <PhotoBlock
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

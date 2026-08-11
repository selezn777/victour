import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
        <TextBlock
          eyebrow="Транспорт"
          title="Не туристический автобус — премиальный минивэн"
          body="Кожаные массажные кресла, ледяной кондиционер и никакой тряски в проходе три часа подряд. Вы отдыхаете уже в дороге — а не терпите её."
        />

        <PhotoBlock
          eyebrow="Компания"
          title="Только вы — и больше никого"
          body="Никаких случайных попутчиков и подстройки под чужой темп. Программа — только для вас и ваших близких, от первой до последней минуты."
          imageSrc="/images/tours/mayak-dai-lan.jpg"
          imageAlt="Пляж у маяка Дай Лань — пусто, только ваша компания"
        />

        <CatalogCta />

        <TextBlock
          eyebrow="Гид"
          title="Личный гид, а не гид на 40 человек в рупор"
          body="Виктор — русскоговорящий гид, который ведёт лично вас, а не толпу через наушник. Отвечает на вопросы по ходу, подстраивается под ваш интерес, а не читает текст по методичке."
          quote="Внимательный, знающий и с отличным чувством юмора"
          quoteAuthor="Nikeshka Sunny, отзыв о туре в Далат"
        />

        <PhotoBlock
          eyebrow="Еда"
          title="Едим там, где вкусно вам — а не по расписанию тур-группы"
          body="Никаких обязательных обедов в туристических столовых. Заезжаем туда, куда хочется — от уличной еды до кофейной фермы."
          imageSrc="/images/tours/dalat-2-dnya.jpg"
          imageAlt="Далат — заезжаем туда, куда хочется, а не по расписанию тур-группы"
          reverse
        />

        <CatalogCta />

        <PhotoBlock
          eyebrow="Темп"
          title="Свой ритм — без магазинов для туристов"
          body="Никаких обязательных заездов в лавки за комиссию гида и спешки «на автобус через 15 минут». Задерживаемся там, где красиво, и пропускаем то, что не интересно."
          imageSrc="/images/tours/severnye-ostrova.jpg"
          imageAlt="Северные острова — тихая бухта в стороне от туристических маршрутов"
        />
      </div>
    </section>
  )
}

import Image from "next/image"
import Link from "next/link"
import { Glow } from "@/components/glow"
import { SlideDeck } from "@/components/slide-deck"

function TourCtaButton() {
  return (
    <Link
      href="/tours"
      className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 sm:px-8 sm:py-3.5 sm:text-base"
    >
      Выбрать тур <span aria-hidden>→</span>
    </Link>
  )
}

function PhotoSlide({
  isFirst,
  eyebrow,
  title,
  body,
  imageSrc,
  imageAlt,
  imagePosition,
}: {
  isFirst?: boolean
  eyebrow: string
  title: string
  body: string
  imageSrc: string
  imageAlt: string
  imagePosition?: string
}) {
  const TitleTag = isFirst ? "h1" : "h2"
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative h-[42%] shrink-0 overflow-hidden sm:h-[46%]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={!!isFirst}
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
          className="kenburns-img object-cover"
          sizes="100vw"
        />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-4 pb-6 sm:px-10 sm:pt-6">
        <p className="mb-1.5 font-heading text-xl leading-none font-semibold sm:text-2xl">
          Вьетнам без чужих
        </p>
        <span className="text-xs font-medium tracking-widest text-primary uppercase">{eyebrow}</span>
        <TitleTag className="mt-1.5 max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {title}
        </TitleTag>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{body}</p>
        <TourCtaButton />
      </div>
    </div>
  )
}

function QuoteSlide({
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
    <div className="relative flex h-full w-full items-center justify-center overflow-y-auto px-5 py-16">
      <Glow side="left" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="mb-1.5 font-heading text-xl leading-none font-semibold sm:text-2xl">
          Вьетнам без чужих
        </p>
        <span className="text-xs font-medium tracking-widest text-primary uppercase">{eyebrow}</span>
        <h2 className="mt-2.5 font-heading text-2xl leading-[1.15] font-semibold sm:text-3xl">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{body}</p>
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
        <TourCtaButton />
      </div>
    </div>
  )
}

export function AdvantagesSection() {
  return (
    <SlideDeck
      slides={[
        <PhotoSlide
          key="transport"
          isFirst
          eyebrow="Транспорт"
          title="Забудьте, каким должен быть трансфер в отпуске"
          body="Кожаные кресла с массажем и кондиционер, который реально спасает от вьетнамской жары, а не просто гудит для вида. Обычно с дороги все приезжают помятыми и раздражёнными. Наши гости выходят из машины будто их только что подвезли до дома, а не через три часа тряски."
          imageSrc="/images/hero/premium-van-interior.jpg"
          imageAlt="Салон премиального минивэна с кожаными креслами"
          imagePosition="30% 50%"
        />,
        <PhotoSlide
          key="company"
          eyebrow="Компания"
          title="Это ваш день, и в нём больше никого"
          body="Никто не опаздывает к автобусу и не тащит всех в дьюти-фри. Программа собрана под вашу компанию — от встречи в отеле до прощания вечером."
          imageSrc="/images/tours/mayak-dai-lan.jpg"
          imageAlt="Пляж у маяка Дай Лань, где кроме вас почти никого нет"
        />,
        <QuoteSlide
          key="guide"
          eyebrow="Гид"
          title="С вами говорит Виктор, а не заезженная методичка"
          body="Он ведёт лично вас: шутит там, где смешно, копает глубже там, где вам действительно интересно. Никакого текста наизусть — живой разговор всю дорогу."
          quote="Внимательный, знающий и с отличным чувством юмора"
          quoteAuthor="Nikeshka Sunny, отзыв о туре в Далат"
        />,
        <PhotoSlide
          key="food"
          eyebrow="Еда"
          title="Проголодались — просто скажите"
          body="Никаких столовых по расписанию тур-группы. Уличная лепёшка с рынка, кофе прямо с фермы — куда захочется, туда и заедем."
          imageSrc="/images/tours/dalat-2-dnya.jpg"
          imageAlt="Далат, куда заезжаем по своему желанию, а не по расписанию тур-группы"
        />,
        <PhotoSlide
          key="pace"
          eyebrow="Темп"
          title="Спешить нас с вами точно не заставят"
          body="Никакой обязательной лавки, где гиду капает процент с ваших покупок. Понравилось место — сидим сколько хочется. Маршрут подстраивается под вас, а не наоборот."
          imageSrc="/images/tours/severnye-ostrova.jpg"
          imageAlt="Северные острова, тихая бухта в стороне от туристических троп"
        />,
        <PhotoSlide
          key="curated"
          eyebrow="Отбор"
          title="Пять туров, а не тридцать пять"
          body="Могли бы предложить маршрут на любой вкус и бюджет. Вместо этого — всего пять, и за каждым личная проверка: безопасный транспорт, продуманный комфорт, программа без лишней спешки. Никакого конвейера — так проще ручаться, что поездка получится хорошей."
          imageSrc="https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/nyachang-avtorskiy-b2ZHevFPr4gfLIEw3aV2oZPHvsRbs9.jpg"
          imageAlt="Золотая пагода в Нячанге — один из пяти отобранных маршрутов"
        />,
      ]}
    />
  )
}

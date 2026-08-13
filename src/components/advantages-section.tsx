import Image from "next/image"
import Link from "next/link"
import { Glow } from "@/components/glow"
import { SlideDeck } from "@/components/slide-deck"

function TourCtaButton() {
  return (
    <Link
      href="/tours"
      className="mt-6 flex w-full max-w-md items-center justify-center self-center rounded-2xl bg-primary px-8 py-5 text-lg font-semibold text-primary-foreground shadow-[0_10px_40px_-8px] shadow-primary/60 ring-1 ring-primary-foreground/10 transition-all hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/80 active:scale-[0.98] sm:py-6 sm:text-xl"
    >
      Выбрать тур
    </Link>
  )
}

function IntroSlide({
  imageSrc,
  imageAlt,
  imagePosition,
}: {
  imageSrc: string
  imageAlt: string
  imagePosition?: string
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative h-[36%] shrink-0 overflow-hidden sm:h-[40%]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
          className="kenburns-img object-cover"
          sizes="100vw"
        />
      </div>
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-5 pt-5 pb-6 text-center sm:px-10 sm:pt-7">
        <h1 className="max-w-xl font-heading text-3xl leading-[1.1] font-semibold sm:text-5xl">
          Вьетнам без чужих
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Мы — лучшие в приватных турах по Вьетнаму. Только самый комфортный транспорт. Только
          по-настоящему вкусная еда для вас. Здесь всё настроено на вашу волну.
        </p>
        <TourCtaButton />
      </div>
    </div>
  )
}

function PhotoSlide({
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
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative h-[36%] shrink-0 overflow-hidden sm:h-[40%]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
          className="kenburns-img object-cover"
          sizes="100vw"
        />
      </div>
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-5 pt-4 pb-6 text-center sm:px-10 sm:pt-6">
        <span className="font-heading text-lg font-semibold tracking-wide text-primary uppercase sm:text-xl">
          {eyebrow}
        </span>
        <h2 className="mt-1.5 max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{body}</p>
        <TourCtaButton />
      </div>
    </div>
  )
}

const CATALOG_TOURS = [
  {
    slug: "severnye-ostrova",
    title: "Северные острова",
    imageSrc: "/images/tours/severnye-ostrova.jpg",
  },
  {
    slug: "hon-tam",
    title: "Хон Там",
    imageSrc: "/images/tours/hon-tam.jpg",
  },
  {
    slug: "mayak-dai-lan",
    title: "Маяк Дай Лань",
    imageSrc: "/images/tours/mayak-dai-lan.jpg",
  },
  {
    slug: "nyachang-avtorskiy",
    title: "Авторский Нячанг",
    imageSrc:
      "https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/nyachang-avtorskiy-b2ZHevFPr4gfLIEw3aV2oZPHvsRbs9.jpg",
  },
  {
    slug: "dalat-2-dnya",
    title: "Далат",
    imageSrc: "/images/tours/dalat-2-dnya.jpg",
  },
]

function ToursSlide() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-5 pt-6 pb-6 text-center sm:px-10 sm:pt-8">
        <span className="font-heading text-lg font-semibold tracking-wide text-primary uppercase sm:text-xl">
          Туры
        </span>
        <h2 className="mt-1.5 max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          Пять маршрутов, а не каталог на любой вкус
        </h2>
        <div className="mt-4 grid w-full max-w-xl grid-cols-3 gap-2 sm:gap-3">
          {CATALOG_TOURS.map((tour) => (
            <Link
              key={tour.slug}
              href={`/tours/${tour.slug}`}
              className="group relative aspect-3/4 overflow-hidden rounded-xl bg-muted first:col-span-3 first:aspect-[2.2/1] sm:first:aspect-[2.6/1]"
            >
              <Image
                src={tour.imageSrc}
                alt={tour.title}
                fill
                sizes="(min-width: 640px) 200px, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-2 text-left text-xs leading-tight font-semibold text-white sm:text-sm">
                {tour.title}
              </span>
            </Link>
          ))}
        </div>
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
        <span className="font-heading text-lg font-semibold tracking-wide text-primary uppercase sm:text-xl">
          {eyebrow}
        </span>
        <h2 className="mt-1.5 font-heading text-2xl leading-[1.15] font-semibold sm:text-3xl">{title}</h2>
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
        <IntroSlide
          key="intro"
          imageSrc="https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-2-0FWzyc7AaHZJfflkozhDvSyKItZnCR.jpg"
          imageAlt="Бухта и маяк Дай Лань с высоты"
        />,
        <PhotoSlide
          key="transport"
          eyebrow="Транспорт"
          title="Забудьте, каким должен быть трансфер в отпуске"
          body="Кожаные кресла с массажем и кондиционер, который реально спасает от вьетнамской жары, а не просто гудит для вида. Обычно с дороги все приезжают помятыми и раздражёнными. Наши гости выходят из машины будто их только что подвезли до дома, а не через три часа тряски."
          imageSrc="/images/hero/premium-van-interior.jpg"
          imageAlt="Салон премиального минивэна с кожаными креслами"
          imagePosition="30% 50%"
        />,
        <ToursSlide key="tours" />,
        <QuoteSlide
          key="guide"
          eyebrow="Гид"
          title="С вами говорит Виктор, а не заезженная методичка"
          body="Он ведёт лично вас: шутит там, где смешно, копает глубже там, где вам действительно интересно. Никакого текста наизусть — живой разговор всю дорогу."
          quote="Внимательный, знающий и с отличным чувством юмора"
          quoteAuthor="Nikeshka Sunny, отзыв о туре в Далат"
        />,
        <PhotoSlide
          key="company"
          eyebrow="Компания"
          title="Это ваш день, и в нём больше никого"
          body="Никто не опаздывает к автобусу и не тащит всех в дьюти-фри. Программа собрана под вашу компанию — от встречи в отеле до прощания вечером."
          imageSrc="/images/tours/mayak-dai-lan.jpg"
          imageAlt="Пляж у маяка Дай Лань, где кроме вас почти никого нет"
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
      ]}
    />
  )
}

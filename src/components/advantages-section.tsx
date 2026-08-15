"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
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

const COLLAGE_PHOTO_COUNT = 66
const COLLAGE_PHOTOS = Array.from(
  { length: COLLAGE_PHOTO_COUNT },
  (_, i) => `/images/collage/collage-${String(i + 1).padStart(2, "0")}.jpg`,
)

// priming — плитка в сетке "подмигивает", пока полноразмерное фото грузится в фоне
// (устраняет мелькание предыдущего кадра) и даёт немного интриги перед раскрытием.
const PRIME_MS = 1000
const HOLD_MS = 3200
const GAP_MS = 900
const TRANSITION_MS = 1000

function shuffledIndices(count: number) {
  const arr = Array.from({ length: count }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 66 не делится ровно на 8/9/12 колонок — последняя строка сетки всегда была бы
// неполной (например, 2 фото в ряду). Вместо этого на каждом брейкпоинте показываем
// только столько фото, сколько составляет целое число строк — остальные скрыты
// классами ниже, сетка всегда представляет собой ровный прямоугольник без обрезков.
const VISIBLE_AT_BASE = Math.floor(COLLAGE_PHOTO_COUNT / 8) * 8 // 8 кол. × 8 строк = 64
const VISIBLE_AT_SM = Math.floor(COLLAGE_PHOTO_COUNT / 9) * 9 // 9 кол. × 7 строк = 63
const VISIBLE_AT_LG = Math.floor(COLLAGE_PHOTO_COUNT / 12) * 12 // 12 кол. × 5 строк = 60

function tileVisibilityClass(i: number) {
  if (i >= VISIBLE_AT_BASE) return "hidden"
  if (i >= VISIBLE_AT_SM) return "sm:hidden"
  if (i >= VISIBLE_AT_LG) return "lg:hidden"
  return ""
}

// Совпадает с брейкпоинтами Tailwind (sm 640px, lg 1024px) и с классами выше —
// раскрытие выбирает только среди фото, которые реально отрисованы на этом экране,
// иначе может выпасть индекс скрытой (display:none) плитки.
function visibleCountForWidth(width: number) {
  if (width >= 1024) return VISIBLE_AT_LG
  if (width >= 640) return VISIBLE_AT_SM
  return VISIBLE_AT_BASE
}

type Phase = "idle" | "priming" | "open"

function PhotoCollage() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [target, setTarget] = useState(0)

  useEffect(() => {
    let cancelled = false
    let step = 0
    // Новая случайная перетасовка при каждом заходе на сайт (не фиксированный порядок) —
    // при этом каждое фото гарантированно показывается один раз за полный проход, прежде
    // чем перетасовать заново и начать следующий круг. Перетасовка ограничена видимыми на
    // этом экране плитками (см. visibleCountForWidth).
    let order = shuffledIndices(visibleCountForWidth(window.innerWidth))
    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms))
    }

    const runCycle = () => {
      if (cancelled) return
      if (step >= order.length) {
        order = shuffledIndices(visibleCountForWidth(window.innerWidth))
        step = 0
      }
      const idx = order[step]
      step += 1
      setTarget(idx)
      setPhase("priming")
      after(() => {
        if (cancelled) return
        setPhase("open")
        after(() => {
          if (cancelled) return
          setPhase("idle")
          after(runCycle, GAP_MS)
        }, HOLD_MS)
      }, PRIME_MS)
    }

    after(runCycle, GAP_MS)
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    // Без фиксированной высоты/aspect-ratio — блок сам подстраивается под контент.
    // Ряды сетки всегда полные (см. tileVisibilityClass), поэтому обрезка не нужна:
    // раскрытие (absolute inset-0) само совпадает по размеру с сеткой пиксель в пиксель.
    <div className="relative w-full shrink-0">
      <div className="grid w-full grid-cols-8 sm:grid-cols-9 lg:grid-cols-12">
        {COLLAGE_PHOTOS.map((src, i) => (
          <div
            key={src}
            className={`relative aspect-square overflow-hidden ${tileVisibilityClass(i)} ${
              phase === "priming" && i === target ? "tile-priming" : ""
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i < 16}
              sizes="(min-width: 1024px) 8vw, (min-width: 640px) 11vw, 12.5vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div
        className={`pointer-events-none absolute inset-0 z-10 transition-all ease-out ${
          phase === "open" ? "scale-100 opacity-100" : "scale-[0.35] opacity-0"
        }`}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      >
        <Image
          src={COLLAGE_PHOTOS[target]}
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          className="scale-110 object-cover opacity-40 blur-2xl"
        />
        <Image src={COLLAGE_PHOTOS[target]} alt="" fill sizes="100vw" className="object-contain" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>
    </div>
  )
}

function IntroSlide() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <PhotoCollage />
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-2 text-center sm:px-10 sm:py-4">
        <h1 className="max-w-xl font-heading text-2xl leading-[1.1] font-semibold sm:text-5xl">
          Вьетнам без чужих
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-snug text-muted-foreground sm:mt-3 sm:leading-relaxed sm:text-base">
          Мы — лучшие в приватных турах по Вьетнаму. Проверенные маршруты, надёжный транспорт и
          гид, который отвечает за вашу безопасность на каждом шаге — здесь всё настроено на вашу
          волну, и ничего не оставлено на волю случая.
        </p>
        <TourCtaButton />
      </div>
    </div>
  )
}

function PhotoSlide({
  title,
  body,
  imageSrc,
  imageAlt,
  imagePosition,
}: {
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
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-5 pt-5 pb-6 text-center sm:px-10 sm:pt-7">
        <h2 className="max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
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
    annotation: "Маршрут, обкатанный лично Виктором — никаких случайных лодочников и левых причалов.",
  },
  {
    slug: "hon-tam",
    title: "Хон Там",
    imageSrc: "/images/tours/hon-tam.jpg",
    annotation: "Ближайший остров без долгих переходов по открытой воде — спокойно даже с детьми.",
  },
  {
    slug: "mayak-dai-lan",
    title: "Маяк Дай Лань",
    imageSrc: "/images/tours/mayak-dai-lan.jpg",
    annotation: "Дикий пляж, но дорога туда — только проверенная, без решений на ходу.",
  },
  {
    slug: "nyachang-avtorskiy",
    title: "Авторский Нячанг",
    imageSrc:
      "https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/nyachang-avtorskiy-b2ZHevFPr4gfLIEw3aV2oZPHvsRbs9.jpg",
    annotation: "Один гид и один водитель весь день — рядом с вами никого чужого.",
  },
  {
    slug: "dalat-2-dnya",
    title: "Далат — 2 дня",
    imageSrc: "/images/tours/dalat-2-dnya.jpg",
    annotation:
      "Не однодневный марш-бросок в горы: два спокойных дня, а вечер в городе — под присмотром, не самостоятельная прогулка.",
  },
]

/**
 * Полосы туров "выбор персонажа" — по одной подсвечивается по очереди сама, ховер
 * ставит на паузу и подсвечивает выбранную. Ширина анимируется через width (не
 * flex-grow — так стабильнее анимируется в разных браузерах).
 */
function TourSelector({ tours }: { tours: typeof CATALOG_TOURS }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % tours.length)
    }, 2200)
    return () => clearInterval(id)
  }, [paused, tours.length])

  return (
    <div
      className="mt-4 flex h-72 w-full max-w-xl gap-1.5 sm:h-80"
      onMouseLeave={() => setPaused(false)}
    >
      {tours.map((tour, i) => {
        const isActive = i === active
        return (
          <Link
            key={tour.slug}
            href={`/tours/${tour.slug}`}
            onMouseEnter={() => {
              setPaused(true)
              setActive(i)
            }}
            className="group relative shrink-0 overflow-hidden rounded-2xl bg-muted transition-[width] duration-500 ease-out"
            style={{ width: isActive ? "40%" : "15%" }}
          >
            <Image
              src={tour.imageSrc}
              alt={tour.title}
              fill
              sizes="(min-width: 640px) 400px, 60vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
            <div
              className={`absolute inset-x-0 bottom-0 p-2.5 text-left transition-opacity duration-300 sm:p-3 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              <h3 className="font-heading text-sm leading-tight font-semibold text-white sm:text-base">
                {tour.title}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/80 sm:text-xs">
                {tour.annotation}
              </p>
            </div>
            {!isActive && (
              <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-[11px] font-semibold text-white/90 [writing-mode:vertical-rl]">
                {tour.title}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

function ToursSlide() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-5 pt-6 pb-6 text-center sm:px-10 sm:pt-8">
        <h2 className="max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          Ровно пять маршрутов — и ни одного лишнего
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Не каталог на любой вкус, а отбор самых безопасных и проверенных программ. Никаких
          однодневных марш-бросков и вечеров, когда гости бродят по незнакомому городу сами по
          себе — каждый маршрут выстроен так, чтобы риск был минимальным.
        </p>
        <TourSelector tours={CATALOG_TOURS} />
        <TourCtaButton />
      </div>
    </div>
  )
}

function QuoteSlide({
  title,
  body,
  quote,
  quoteAuthor,
}: {
  title: string
  body: string
  quote: string
  quoteAuthor: string
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-y-auto px-5 py-16">
      <Glow side="left" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2 className="font-heading text-2xl leading-[1.15] font-semibold sm:text-3xl">{title}</h2>
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
        <IntroSlide key="intro" />,
        <PhotoSlide
          key="transport"
          title="Забудьте, каким должен быть трансфер в отпуске"
          body="Кожаные кресла с массажем и кондиционер, который реально спасает от вьетнамской жары, а не просто гудит для вида. За рулём — один и тот же проверенный водитель, которого лично знает Виктор, а не случайный человек с трассы. Наши гости выходят из машины будто их только что подвезли до дома, а не через три часа тряски."
          imageSrc="/images/hero/premium-van-interior.jpg"
          imageAlt="Салон премиального минивэна с кожаными креслами"
          imagePosition="30% 50%"
        />,
        <ToursSlide key="tours" />,
        <QuoteSlide
          key="guide"
          title="С вами говорит Виктор, а не заезженная методичка"
          body="Он ведёт лично вас: шутит там, где смешно, копает глубже там, где вам действительно интересно. Никакого текста наизусть — живой разговор всю дорогу, и личная ответственность за маршрут и вашу безопасность от первой до последней минуты."
          quote="Внимательный, знающий и с отличным чувством юмора"
          quoteAuthor="Nikeshka Sunny, отзыв о туре в Далат"
        />,
        <PhotoSlide
          key="company"
          title="Это ваш день, и в нём больше никого"
          body="Никто не опаздывает к автобусу и не тащит всех в дьюти-фри. Программа собрана под вашу компанию — от встречи в отеле до прощания вечером."
          imageSrc="/images/tours/mayak-dai-lan.jpg"
          imageAlt="Пляж у маяка Дай Лань, где кроме вас почти никого нет"
        />,
        <PhotoSlide
          key="food"
          title="Проголодались — просто скажите"
          body="Никаких столовых по расписанию тур-группы. Уличная лепёшка с рынка, кофе прямо с фермы — куда захочется, туда и заедем."
          imageSrc="/images/tours/dalat-2-dnya.jpg"
          imageAlt="Далат, куда заезжаем по своему желанию, а не по расписанию тур-группы"
        />,
        <PhotoSlide
          key="pace"
          title="Спешить нас с вами точно не заставят"
          body="Никакой обязательной лавки, где гиду капает процент с ваших покупок. Понравилось место — сидим сколько хочется. Маршрут подстраивается под вас, а не наоборот."
          imageSrc="/images/tours/severnye-ostrova.jpg"
          imageAlt="Северные острова, тихая бухта в стороне от туристических троп"
        />,
      ]}
    />
  )
}

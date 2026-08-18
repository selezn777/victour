"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { SlideDeck } from "@/components/slide-deck"
import { PhotoStack } from "@/components/photo-stack"
import type { Review } from "@/lib/reviews-data"

function TourCtaButton() {
  return (
    <Link
      href="/tours"
      className="mt-6 flex w-full items-center justify-center self-stretch rounded-2xl bg-primary px-8 py-5 text-lg font-semibold text-primary-foreground shadow-[0_10px_40px_-8px] shadow-primary/35 ring-1 ring-primary-foreground/10 transition-all hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/50 active:scale-[0.98] sm:py-6 sm:text-xl"
    >
      Выбрать тур
    </Link>
  )
}

const COLLAGE_PHOTO_COUNT = 65
const COLLAGE_PHOTOS = Array.from(
  { length: COLLAGE_PHOTO_COUNT },
  (_, i) => `/images/collage/collage-${String(i + 1).padStart(2, "0")}.jpg`,
)

// priming — плитка в сетке "подмигивает", пока полноразмерное фото грузится в фоне
// (устраняет мелькание предыдущего кадра) и даёт немного интриги перед раскрытием.
const PRIME_MS = 1000
const HOLD_MS = 3040
const GAP_MS = 850
const TRANSITION_MS = 1000

function shuffledIndices(count: number) {
  const arr = Array.from({ length: count }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// На мобиле (< sm) высота полосы — как задумывалась изначально: побочный эффект
// "строк × ширина плитки", без верхней границы (8 кол. × 8 строк — почти квадрат,
// это и есть исходный "полноэкранный" вид, который нужно сохранить как есть).
// Начиная с sm экран становится шире, но не пропорционально выше — та же формула
// давала на широких экранах сетку на сотни пикселей выше, чем оставалось места под
// заголовок. Поэтому с sm и выше высота полосы дополнительно ограничена в CSS
// (см. className на обёртке ниже) и строк выделено меньше, чтобы почти попадать
// в размер без обрезки лишнего.
const VISIBLE_AT_BASE = Math.floor(COLLAGE_PHOTO_COUNT / 8) * 8 // 8 кол. × 8 строк = 64, как исходно
const VISIBLE_AT_SM = 9 * 4 // 9 кол. × 4 строки — с sm полоса дополнительно ограничена высотой
const VISIBLE_AT_LG = 12 * 3 // 12 кол. × 3 строки — на lg плитка ощутимо шире, строк меньше

function tileVisibilityClass(i: number) {
  if (i >= VISIBLE_AT_BASE) return "hidden"
  if (i >= VISIBLE_AT_SM) return "sm:hidden"
  if (i >= VISIBLE_AT_LG) return "lg:hidden"
  return ""
}

function visibleCountForWidth(width: number) {
  if (width >= 1024) return VISIBLE_AT_LG
  if (width >= 640) return VISIBLE_AT_SM
  return VISIBLE_AT_BASE
}

function gridColsForWidth(width: number) {
  if (width >= 1024) return 12
  if (width >= 640) return 9
  return 8
}

// Сколько раскрытий одновременно — по числу колонок в сетке на этом брейкпоинте
// (1 на мобиле, 2 с sm, 3 с lg). Каждое привязано к своей "полосе" колонок (см.
// bandColumnRange), чтобы моргнувшая плитка и большое раскрытие всегда были в
// одной и той же области экрана, а не в разных.
function bandCountForWidth(width: number) {
  if (width >= 1024) return 3
  if (width >= 640) return 2
  return 1
}

function bandColumnRange(bandIndex: number, bandCount: number, cols: number): [number, number] {
  const start = Math.floor((bandIndex / bandCount) * cols)
  const end = Math.floor(((bandIndex + 1) / bandCount) * cols)
  return [start, end]
}

// Позиция и ширина полосы i из N — те же трети/половины, что и в CSS-классах
// BAND_LAYOUT ниже (держать в синхроне вручную, т.к. Tailwind-классы должны
// быть статичными строками для сборки). z-20 обязателен: ни .grid, ни внешний
// контейнер коллажа не создают свой stacking context (нет z-index/transform), так
// что z-10 у "приподнятой" плитки внутри сетки иначе всплывает выше полосы
// раскрытия (сравнение идёт не по DOM-порядку, а по z-index — 10 > auto).
const BAND_LAYOUT = [
  "absolute inset-y-0 left-0 z-20 w-full overflow-hidden pointer-events-none sm:w-1/2 lg:w-1/3",
  "absolute inset-y-0 z-20 hidden w-1/2 overflow-hidden pointer-events-none sm:left-1/2 sm:block lg:left-1/3 lg:w-1/3",
  "absolute inset-y-0 z-20 hidden overflow-hidden pointer-events-none lg:left-2/3 lg:block lg:w-1/3",
]
const BAND_SIZES = [
  "(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw",
  "(min-width: 1024px) 34vw, 50vw",
  "34vw",
]

// "closing" — отдельная фаза между open и idle: ровно TRANSITION_MS, за
// которые полоса раскрытия (см. PhotoCollage) визуально стягивается обратно
// к точке блика, прежде чем цикл продолжится дальше и переиспользует этот
// же узел под следующую плитку.
type Phase = "idle" | "priming" | "open" | "closing"

// Полноразмерный вариант (sizes=100vw) — это ДРУГОЙ файл/URL у Next/Image, чем маленькая
// плитка (sizes~12vw), так что готовность тайла в кэше ничего не значит для раскрытия.
// На медленной мобильной сети скачивание не укладывалось в фиксированный PRIME_MS — браузер
// держит на экране ПРЕДЫДУЩУЮ картинку, пока новая не догрузится, и раскрытие стартовало по
// таймеру раньше, чем реально сменился src: подмигнула одна плитка, а открылось предыдущее
// фото. Раскрытие теперь ждёт реальной загрузки (плюс минимум PRIME_MS ради самого моргания).
function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

// Раскрытие — по одному за раз В КАЖДОЙ полосе колонок (см. bandCountForWidth) —
// на мобиле полоса одна (всё раскрытие целиком), с sm и lg — 2 и 3 независимых
// параллельных цикла, каждый выбирает случайную плитку ТОЛЬКО из своей полосы
// (Виктор: "2 фото, 2 разных фото должны открываться, или 3" — раскрытий
// одновременно должно быть несколько на широком экране, как было раньше, но
// теперь блик и большое раскрытие всегда в одной и той же области, не вразнобой).
function useRevealCycle(bandIndex: number) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [target, setTarget] = useState(0)
  const [origin, setOrigin] = useState("50% 50%")

  useEffect(() => {
    let cancelled = false
    let order: number[] = []
    let step = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms))
    }
    const wait = (ms: number) => new Promise<void>((resolve) => after(resolve, ms))

    // Пул плиток пересчитывается на лету по текущей ширине окна (тот же приём,
    // что уже был для visibleCountForWidth) — если у этой полосы на текущем
    // брейкпоинте вообще нет места (bandIndex >= число полос), цикл просто ждёт.
    const currentPool = () => {
      const width = window.innerWidth
      const cols = gridColsForWidth(width)
      const rows = visibleCountForWidth(width) / cols
      const bandCount = bandCountForWidth(width)
      if (bandIndex >= bandCount) return null
      const [start, end] = bandColumnRange(bandIndex, bandCount, cols)
      const visibleCount = cols * rows
      const pool = Array.from({ length: visibleCount }, (_, i) => i).filter((i) => {
        const col = i % cols
        return col >= start && col < end
      })
      return { pool, cols, rows, start, end }
    }

    const runCycle = () => {
      if (cancelled) return
      const ctx = currentPool()
      if (!ctx || ctx.pool.length === 0) {
        after(runCycle, GAP_MS)
        return
      }
      if (step >= order.length) {
        order = shuffledIndices(ctx.pool.length).map((i) => ctx.pool[i])
        step = 0
      }
      const idx = order[step]
      step += 1
      // Точка, откуда визуально "вырастает" полоса раскрытия — позиция плитки
      // внутри СВОЕЙ полосы (не всей сетки), в процентах, чисто арифметикой.
      const col = idx % ctx.cols
      const row = Math.floor(idx / ctx.cols)
      const bandCols = ctx.end - ctx.start
      const originX = ((col - ctx.start + 0.5) / bandCols) * 100
      const originY = ((row + 0.5) / ctx.rows) * 100
      setTarget(idx)
      setOrigin(`${originX}% ${originY}%`)
      setPhase("priming")
      Promise.all([preloadImage(COLLAGE_PHOTOS[idx]), wait(PRIME_MS)]).then(() => {
        if (cancelled) return
        setPhase("open")
        after(() => {
          if (cancelled) return
          setPhase("closing")
          after(() => {
            if (cancelled) return
            setPhase("idle")
            after(runCycle, GAP_MS)
          }, TRANSITION_MS)
        }, HOLD_MS)
      })
    }

    after(runCycle, GAP_MS)
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [bandIndex])

  return { phase, target, origin }
}

function PhotoCollage() {
  // Три параллельных цикла (по числу полос на самом широком брейкпоинте — lg),
  // каждый на своём брейкпоинте либо активен (своя полоса колонок), либо просто
  // ждёт (bandIndex >= bandCountForWidth). Хуков всегда ровно 3 — иначе нарушится
  // React Rules of Hooks при смене ширины окна.
  const reveals = [useRevealCycle(0), useRevealCycle(1), useRevealCycle(2)]
  const activeByTile = new Map(reveals.filter((r) => r.phase !== "idle").map((r) => [r.target, r]))

  return (
    // База (< sm) — без ограничения высоты, ряды сетки всегда полные (см.
    // tileVisibilityClass). С sm и выше высота дополнительно ограничена явно
    // (% от высоты слайда) — на широком экране та же формула строк даёт сетку
    // выше, чем есть места под заголовок, overflow-hidden подчищает лишнее.
    <div className="relative w-full shrink-0 overflow-hidden sm:h-[38svh] lg:h-[32svh]">
      <div className="grid w-full grid-cols-8 sm:grid-cols-9 lg:grid-cols-12">
        {COLLAGE_PHOTOS.map((src, i) => {
          const isPriming = activeByTile.get(i)?.phase === "priming"
          return (
            <div
              key={src}
              className={`relative aspect-square overflow-hidden ${tileVisibilityClass(i)} ${
                isPriming ? "tile-priming" : ""
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
          )
        })}
      </div>
      {/* Раскрытие "на весь блок" (Виктор: "должны раскрываться на весь размер
          блока") — своя полоса колонок на каждый цикл (BAND_LAYOUT), фото внутри
          неё растёт от той же точки, где моргнула плитка (см. origin), пока не
          займёт всю полосу целиком, и так же стягивается обратно.

          Раньше плитка САМА тоже увеличивалась (scale до 2.6x на своём месте в
          сетке) ОДНОВРЕМЕННО с этой полосой — два независимых слоя с разными
          конечными размерами росли на одной и той же фотографии, и наложение
          двух несинхронных по итоговому размеру анимаций читалось как "рывок,
          картинка вдруг становится другой" (то, что Виктор описал даже когда
          фото было одно и то же). Плитка больше не растёт — весь рост теперь
          только в этом единственном слое (band), не с чем конфликтовать.

          opacity переключается МГНОВЕННО (не входит в transitionProperty) —
          только transform (scale) анимируется плавно все TRANSITION_MS и на
          открытии, и на закрытии. rendered держит слой видимым (opacity:1) всю
          фазу "closing", пока transform идёт от scale(1) обратно к малому —
          иначе стягивание было бы не видно (пропадало бы вместе с opacity).
          open переключает саму цель transform ровно на границе open→closing —
          синхронно с моментом, когда полоса должна начать именно стягиваться
          (не раньше и не позже), так что рост/сжатие идут одним непрерывным
          движением от блика до полного размера и обратно. */}
      {reveals.map((reveal, b) => {
        const open = reveal.phase === "open"
        const rendered = open || reveal.phase === "closing"
        return (
          <div key={b} className={BAND_LAYOUT[b]}>
            <div
              className="absolute inset-0"
              style={{
                transformOrigin: reveal.origin,
                transform: open ? "scale(1)" : "scale(0.15)",
                opacity: rendered ? 1 : 0,
                transitionProperty: "transform",
                transitionTimingFunction: "ease-out",
                transitionDuration: `${TRANSITION_MS}ms`,
                boxShadow: rendered ? "0 20px 45px -12px rgba(0,0,0,0.55)" : undefined,
              }}
            >
              <Image src={COLLAGE_PHOTOS[reveal.target]} alt="" fill sizes={BAND_SIZES[b]} className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function IntroSlide() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <PhotoCollage />
      <div className="flex flex-1 flex-col items-center overflow-y-auto pl-7 pr-5 pt-5 pb-6 text-center sm:pl-12 sm:pr-10 sm:pt-7">
        <h1 className="max-w-xl font-heading text-2xl leading-[1.1] font-semibold sm:text-5xl">
          Вьетнам без чужих
        </h1>
        <p className="mt-3 max-w-md text-base leading-snug font-medium text-foreground sm:mt-4 sm:max-w-xl sm:text-xl">
          Лучшие приватные туры по Вьетнаму.
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground sm:max-w-xl sm:text-base">
          Проверенные маршруты, надёжный транспорт и гид, который отвечает за вашу безопасность на
          каждом шаге.
        </p>
        <TourCtaButton />
      </div>
    </div>
  )
}

function PhotoSlide({
  title,
  accent,
  body,
  imageSrc,
  imageAlt,
  imagePosition,
  stackImages,
}: {
  title: string
  /** Короткая акцентная строка между заголовком и описанием — тот же приём,
   * что на первом слайде (IntroSlide). */
  accent?: string
  body: string
  imageSrc: string
  imageAlt: string
  imagePosition?: string
  /** Если задано (2+ фото) — вместо статичного фото рендерится интерактивная
   * стопка (PhotoStack): фото падают друг на друга при появлении, тап
   * перемешивает по кругу. */
  stackImages?: string[]
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative h-[36%] shrink-0 sm:h-[40%]">
        {stackImages && stackImages.length > 1 ? (
          <div className="h-full w-full p-5 pb-8 sm:p-7 sm:pb-10">
            <PhotoStack photos={stackImages} alt={imageAlt} />
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              style={imagePosition ? { objectPosition: imagePosition } : undefined}
              className="kenburns-img object-cover"
              sizes="100vw"
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center overflow-y-auto pl-7 pr-5 pt-5 pb-6 text-center sm:pl-12 sm:pr-10 sm:pt-7">
        <h2 className="max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {title}
        </h2>
        {accent && (
          <p className="mt-2 max-w-md text-base leading-snug font-medium text-foreground sm:mt-3 sm:max-w-xl sm:text-xl">
            {accent}
          </p>
        )}
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground sm:max-w-xl sm:text-base">
          {body}
        </p>
        <TourCtaButton />
      </div>
    </div>
  )
}

// Слайд без фото — три коротких тезиса под общим заголовком, разделённые
// линиями (Виктор попросил объединить 3 прежних отдельных слайда —
// компания/темп/еда — в один; фото убрали совсем, чтобы под три тезиса
// хватило места без утомительного скролла на мобиле).
function ValuesSlide({
  title,
  points,
}: {
  title: string
  points: { title: string; body: string }[]
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto pl-7 pr-5 py-6 text-center sm:pl-12 sm:pr-10">
        <h2 className="max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {title}
        </h2>
        <div className="mt-6 w-full max-w-md space-y-5 text-left">
          {points.map((point, i) => (
            <div key={point.title} className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold sm:text-lg">{point.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground sm:text-base">{point.body}</p>
              </div>
            </div>
          ))}
        </div>
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
    title: "Далат, 2 дня",
    imageSrc: "/images/tours/dalat-2-dnya.jpg",
    annotation:
      "Не однодневный марш-бросок в горы: два спокойных дня, а вечер в городе — под присмотром, не самостоятельная прогулка.",
  },
]

// Лёгкая "горная" волна — центральная карточка чуть выше соседей, крайние
// на общей линии. Разноуровневость вместо ровного ряда, как попросил
// Виктор ("максимально дизайнерски"), но без резкого зигзага — тема
// маршрутов/гор считывается, а не выглядит как визуальный шум.
const STAGGER = ["", "mt-2.5", "mt-4", "mt-2.5", ""]

/**
 * Полосы туров "выбор персонажа" — разноуровневый ряд, ховер (десктоп) чуть
 * приподнимает тенью. Подпись — ПОД картинкой, не поверх неё: раньше текст
 * поверх фото либо обрезался (line-clamp), либо терялся на светлом фото
 * при любой технике контраста (тень/плашка) — Виктор много раз забраковал
 * оба варианта. Подпись снаружи фото решает это раз и навсегда — полный
 * текст, без ограничения по высоте. Коннектор — тонкая линия с точкой
 * (не иконка-стрелка, которую Виктор посчитал слишком прямолинейной).
 */
function TourSelector({ tours }: { tours: typeof CATALOG_TOURS }) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="mt-2 flex w-full max-w-3xl items-start gap-1 sm:mt-4 sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
      {tours.map((tour, i) => (
        <div key={tour.slug} className={`flex flex-1 flex-col items-center ${STAGGER[i % STAGGER.length]}`}>
          <Link
            href={`/tours/${tour.slug}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`relative h-56 w-full overflow-hidden rounded-[1px] bg-muted ring-1 ring-white/10 transition-shadow duration-500 ease-out sm:h-64 lg:h-72 ${
              i === active ? "shadow-[0_10px_28px_-6px_rgba(0,0,0,0.55)]" : ""
            }`}
          >
            <Image
              src={tour.imageSrc}
              alt={tour.title}
              fill
              sizes="(min-width: 1024px) 700px, (min-width: 640px) 400px, 60vw"
              className="object-cover brightness-100"
            />
          </Link>
          <div className="relative mt-1.5 h-3 w-px shrink-0 bg-primary/40">
            <span className="absolute -bottom-px left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary/70" />
          </div>
          <span className="mt-1 text-center font-heading text-[10px] leading-tight font-semibold text-foreground sm:text-xs">
            {tour.title}
          </span>
        </div>
      ))}
    </div>
  )
}

function ToursSlide() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center overflow-y-auto pl-7 pr-5 pt-1 pb-6 text-center sm:pl-12 sm:pr-10 sm:pt-2">
        <h2 className="max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          Ровно пять маршрутов — и ни одного лишнего
        </h2>
        <TourSelector tours={CATALOG_TOURS} />
        <p className="mt-4 max-w-md text-base leading-snug font-medium text-foreground sm:max-w-xl sm:text-xl">
          Отбор — а не каталог на любой вкус.
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground sm:max-w-xl sm:text-base">
          Никаких однодневных марш-бросков и вечеров, когда гости бродят по незнакомому городу сами
          по себе — каждый маршрут обкатан лично.
        </p>
        <TourCtaButton />
      </div>
    </div>
  )
}

type Quote = { quote: string; author: string }

function reviewToQuote(r: Review): Quote {
  const target = r.tourTitle
    ? `отзыв о туре «${r.tourTitle}»`
    : r.guideName
      ? `отзыв о гиде ${r.guideName}`
      : "отзыв гостя"
  return { quote: r.text ?? "", author: `${r.authorName}, ${target}` }
}

// На мобиле карточки-цитаты в столбик не влезали в высоту слайда вместе с
// кнопкой — сама секция скроллится (overflow-y-auto), но Swiper того же
// направления (vertical) перехватывает вертикальный тач-свайп раньше, чем до
// него доходит внутренний скролл, и кнопка оставалась недостижима. Прошли
// через пару итераций (карусель по одной, потом узкий ряд по 2-3 в кадре) —
// Виктор в итоге попросил именно "слоями друг за другом" (стопкой карточек
// внахлёст, следующая проглядывает из-за первой), а не сжатые side-by-side
// карточки. line-clamp на тексте цитаты держит высоту карточек одинаковой
// независимо от длины реального отзыва — иначе стопка "прыгала" бы при
// переключении. С sm и шире — обычная CSS grid (там высота не проблема).
function QuoteCard({ quote, author }: { quote: string; author: string }) {
  return (
    <blockquote className="relative flex h-full flex-col rounded-2xl border border-border bg-card p-4 text-left shadow-lg sm:p-5">
      <span aria-hidden className="font-heading text-3xl leading-none text-primary/30 sm:text-4xl">
        “
      </span>
      <p className="-mt-1 line-clamp-5 text-xs text-foreground/90 italic sm:-mt-2 sm:line-clamp-6 sm:text-sm">
        {quote}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground sm:mt-3 sm:gap-2 sm:text-xs">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs sm:size-6 sm:text-sm">
          🙂
        </span>
        <span className="line-clamp-1">{author}</span>
      </p>
    </blockquote>
  )
}

const SWIPE_THRESHOLD_PX = 40

// Виктор уточнил ещё раз: 2 карточки друг под другом должны листаться
// НЕЗАВИСИМО — свайп по верхней листает только верхнюю, свайп по нижней
// только нижнюю (не единой парой), и сам переход — чуть мягче (длиннее и
// меньше сдвиг), чем было. Каждая карточка — свой независимый "слот" со
// своим индексом по общему пулу отзывов.
function useQuoteSlot(quotes: Quote[], startIndex: number) {
  const [index, setIndex] = useState(startIndex)
  const [direction, setDirection] = useState<1 | -1>(1)
  // setTimeout, а не requestAnimationFrame — см. коммит с фиксом выше: rAF в
  // невидимой/неактивной вкладке может не сработать вообще, карточка тогда
  // застревает прозрачной навсегда.
  const [entering, setEntering] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setEntering(false), 20)
    return () => window.clearTimeout(id)
  }, [index])

  const advance = (dir: 1 | -1) => {
    setDirection(dir)
    setEntering(true)
    setIndex((i) => (i + dir + quotes.length) % quotes.length)
  }

  return {
    quote: quotes[index],
    index,
    direction,
    entering,
    onTouchStart: (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const delta = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
      advance(delta < 0 ? 1 : -1)
    },
  }
}

function QuoteSlotView({ slot }: { slot: ReturnType<typeof useQuoteSlot> }) {
  return (
    <div className="overflow-hidden" onTouchStart={slot.onTouchStart} onTouchEnd={slot.onTouchEnd}>
      <div
        key={slot.index}
        className={`transition-all duration-[380ms] ease-out ${
          slot.entering ? (slot.direction === 1 ? "translate-x-4 opacity-0" : "-translate-x-4 opacity-0") : "translate-x-0 opacity-100"
        }`}
      >
        <QuoteCard quote={slot.quote.quote} author={slot.quote.author} />
      </div>
    </div>
  )
}

function QuotePairs({ quotes }: { quotes: Quote[] }) {
  const safeQuotes = quotes.length > 0 ? quotes : [{ quote: "", author: "" }]
  const top = useQuoteSlot(safeQuotes, 0)
  const bottom = useQuoteSlot(safeQuotes, Math.min(1, safeQuotes.length - 1))

  if (quotes.length === 0) return null

  return (
    <div className="mt-5 flex w-full max-w-xs flex-col gap-3 sm:hidden">
      <QuoteSlotView slot={top} />
      <QuoteSlotView slot={bottom} />
    </div>
  )
}

function QuoteSlide({
  title,
  body,
  quotes,
}: {
  title: string
  body: string
  quotes: Quote[]
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative flex flex-1 flex-col items-center overflow-y-auto pl-7 pr-5 pt-3 pb-10 text-center sm:pl-12 sm:pr-10 sm:pt-4 sm:pb-8">
        <h2 className="max-w-2xl font-heading text-2xl leading-[1.15] font-semibold sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-snug text-muted-foreground sm:mt-3 sm:text-base sm:leading-relaxed">
          {body}
        </p>

        <QuotePairs quotes={quotes} />

        {quotes.length > 0 && (
          <div className="mt-6 hidden w-full max-w-5xl gap-3 sm:grid sm:grid-cols-3 lg:max-w-6xl lg:grid-cols-4 xl:max-w-7xl xl:grid-cols-6">
            {quotes.map(({ quote, author }, i) => (
              <div key={author} className={i === 3 ? "hidden lg:block" : i >= 4 ? "hidden xl:block" : ""}>
                <QuoteCard quote={quote} author={author} />
              </div>
            ))}
          </div>
        )}

        <TourCtaButton />
        <Link href="/reviews" className="mt-3 text-sm text-primary hover:underline">
          Все отзывы →
        </Link>
      </div>
    </div>
  )
}

export function AdvantagesSection({ heroQuotes }: { heroQuotes: Review[] }) {
  return (
    <SlideDeck
      slides={[
        <IntroSlide key="intro" />,
        <PhotoSlide
          key="transport"
          title="Забудьте, каким должен быть трансфер в отпуске"
          accent="Гости выходят из машины так, будто их подвезли до дома, а не трясли три часа."
          body="Кожаные кресла с массажем, кондиционер, который реально спасает от жары, и за рулём — один и тот же проверенный водитель, которого лично знает Виктор, а не случайный человек с трассы."
          imageSrc="/images/hero/premium-van-interior.jpg"
          imageAlt="Салон премиального минивэна с кожаными креслами"
          imagePosition="30% 50%"
          stackImages={[
            "/images/hero/premium-van-interior-2.jpg",
            "/images/hero/premium-van-exterior.jpg",
            "/images/hero/premium-van-interior-3.jpg",
          ]}
        />,
        <ToursSlide key="tours" />,
        <ValuesSlide
          key="values"
          title="Ваша поездка — под вас, а не под группу"
          points={[
            {
              title: "Только вы — и больше никого",
              body: "Никого не ждём и никуда не спешим за компанию — маршрут собран под вас, от встречи в отеле до прощания вечером.",
            },
            {
              title: "Без разводов на магазины",
              body: "Ни одной обязательной лавки, где гиду капает процент с ваших покупок — заезжаем только туда, что интересно вам.",
            },
            {
              title: "Меню выбираете вы",
              body: "Никакого комплексного обеда по расписанию — сами решаете, что и где заказать. Для многих гостей это принципиально.",
            },
          ]}
        />,
        <QuoteSlide
          key="guide"
          title="Что говорят гости, которые уже были с нами"
          body="Внимание к мелочам и забота о безопасности — вот что нам чаще всего пишут после поездки."
          quotes={heroQuotes.map(reviewToQuote)}
        />,
      ]}
    />
  )
}

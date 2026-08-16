"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { SlideDeck } from "@/components/slide-deck"
import type { Review } from "@/lib/reviews-data"

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

function DiscountTiles({ packageDiscounts }: { packageDiscounts: Record<string, number> }) {
  const tiers = Object.entries(packageDiscounts).sort(([a], [b]) => Number(a) - Number(b))
  return (
    <div className="grid grid-cols-3 gap-3">
      {tiers.map(([count, pct]) => (
        <div key={count} className="rounded-xl border border-border bg-card px-3 py-4 text-center shadow-sm">
          <div className="font-heading text-xl font-semibold text-primary sm:text-2xl">−{pct}%</div>
          <div className="mt-1 text-xs text-muted-foreground">{count} тура</div>
        </div>
      ))}
    </div>
  )
}

// Тизер-плашка снизу слайдов (начиная со слайда с отзывами) — раньше на
// последнем слайде карусели свайп дальше "отпускал" её в обычный скролл
// страницы, и снизу незаметно наезжал блок скидок — Виктор наткнулся на
// это случайно и не понял, что произошло. Явная плашка с открытым текстом
// решает то же самое осознанно: видно, что там акция, и как её открыть —
// тапом или свайпом вверх. swiper-no-swiping — встроенный механизм Swiper
// (не самодельный CSS-трюк) — не даёт деке ТАКЖЕ среагировать на этот же
// вертикальный жест как на "следующий слайд".
function DiscountTeaser({ packageDiscounts }: { packageDiscounts: Record<string, number> }) {
  const [open, setOpen] = useState(false)

  const tiers = Object.entries(packageDiscounts)
  if (tiers.length === 0) return null
  const maxPct = Math.max(...tiers.map(([, pct]) => pct))

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Скидка до −${maxPct}% на пакет туров`}
        className="swiper-no-swiping absolute top-4 right-4 z-20 flex size-12 items-center justify-center rounded-full bg-primary text-xl shadow-lg shadow-primary/40 transition-transform hover:scale-105 active:scale-95 sm:top-5 sm:right-6 sm:size-14"
      >
        🎁
      </button>

      {open && (
        <div className="swiper-no-swiping absolute inset-0 z-30 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative rounded-t-3xl border-t border-border bg-background p-5 pb-6 text-center shadow-2xl">
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              ✕
            </button>
            <h3 className="px-8 font-heading text-lg font-semibold sm:text-xl">
              Больше туров в пакете — больше скидка
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Скидка считается автоматически при бронировании нескольких программ.
            </p>
            <div className="mt-4">
              <DiscountTiles packageDiscounts={packageDiscounts} />
            </div>
            <TourCtaButton />
          </div>
        </div>
      )}
    </>
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

type Phase = "idle" | "priming" | "open"

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

// Раньше раскрывалась только одна плитка сразу. На широком экране места хватает
// на несколько одновременных раскрытий — каждый слот крутит СВОЙ независимый
// цикл (staggerMs разводит их по времени, чтобы не открывались синхронно).
// Слот держит собственное состояние на верхнем уровне PhotoCollage (см. вызовы
// useRevealCycle ниже), а видимость/ширина самого блока управляется CSS-классами
// в RevealSlot — так на узком экране лишние слоты просто не рендерятся визуально,
// без JS-определения ширины экрана и связанных с ним гонок.
function useRevealCycle(staggerMs: number) {
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
    const wait = (ms: number) => new Promise<void>((resolve) => after(resolve, ms))

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
      Promise.all([preloadImage(COLLAGE_PHOTOS[idx]), wait(PRIME_MS)]).then(() => {
        if (cancelled) return
        setPhase("open")
        after(() => {
          if (cancelled) return
          setPhase("idle")
          after(runCycle, GAP_MS)
        }, HOLD_MS)
      })
    }

    after(runCycle, GAP_MS + staggerMs)
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // staggerMs — константа на весь жизненный цикл компонента, менять её не нужно.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { phase, target }
}

// Показать со слота i включительно — начиная с какого брейкпоинта он появляется.
// Пусто (i===0) значит виден всегда. flex-1 на каждом слоте сам делит ширину
// поровну между видимыми — явно считать доли/ширины в процентах не нужно.
const SLOT_VISIBILITY = ["", "hidden sm:flex", "hidden md:flex", "hidden lg:flex", "hidden xl:flex"]

function RevealSlot({
  reveal,
  visibilityClass,
}: {
  reveal: { phase: Phase; target: number }
  visibilityClass: string
}) {
  return (
    <div className={`relative h-full flex-1 ${visibilityClass}`}>
      <div
        className={`absolute inset-0 bg-black transition-opacity ease-out ${
          reveal.phase === "open" ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      >
        {/* Полоса под коллаж короткая и широкая — у портретного/квадратного фото
            object-contain оставлял большие пустые поля по бокам (даже с непрозрачным
            фоном под ними это выглядело как "марка", а не как полноэкранное раскрытие).
            object-cover заполняет весь слот целиком, обрезая лишнее по краям. */}
        <Image
          src={COLLAGE_PHOTOS[reveal.target]}
          alt=""
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 34vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>
    </div>
  )
}

function PhotoCollage() {
  // Раньше повышалось только с lg (1024) и 2xl (1536) — на реальном планшете (обычно
  // 700–1000px) так и оставалось 1 раскрытие вместо обещанных "по 2, по 3". Теперь
  // ступени плотнее: 1 (телефон) → 2 (sm, 640) → 3 (md, 768) → 4 (lg, 1024) →
  // 5 (xl, 1280, ноутбук и шире) — каждый слот крутит независимый цикл со сдвигом.
  const reveals = [
    useRevealCycle(0),
    useRevealCycle(900),
    useRevealCycle(1800),
    useRevealCycle(2700),
    useRevealCycle(3600),
  ]

  const primingTiles = new Set(
    reveals.filter((r) => r.phase === "priming").map((r) => r.target),
  )

  return (
    // База (< sm) — без ограничения высоты, ряды сетки всегда полные (см.
    // tileVisibilityClass), обрезка не нужна: исходный "полноэкранный" вид как есть.
    // С sm и выше высота дополнительно ограничена явно (% от высоты слайда) —
    // на широком экране та же формула строк даёт сетку выше, чем есть места под
    // заголовок, overflow-hidden подчищает то, что не влезло.
    <div className="relative w-full shrink-0 sm:h-[38svh] sm:overflow-hidden lg:h-[32svh]">
      <div className="grid w-full grid-cols-8 sm:grid-cols-9 lg:grid-cols-12">
        {COLLAGE_PHOTOS.map((src, i) => (
          <div
            key={src}
            className={`relative aspect-square overflow-hidden ${tileVisibilityClass(i)} ${
              primingTiles.has(i) ? "tile-priming" : ""
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
      <div className="pointer-events-none absolute inset-0 z-10 flex">
        {reveals.map((reveal, i) => (
          <RevealSlot key={i} reveal={reveal} visibilityClass={SLOT_VISIBILITY[i]} />
        ))}
      </div>
    </div>
  )
}

function IntroSlide() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <PhotoCollage />
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto pl-7 pr-5 py-2 text-center sm:pl-12 sm:pr-10 sm:py-4">
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
  discountTeaser,
}: {
  title: string
  body: string
  imageSrc: string
  imageAlt: string
  imagePosition?: string
  discountTeaser?: ReactNode
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
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
      <div className="flex flex-1 flex-col items-center overflow-y-auto pl-7 pr-5 pt-5 pb-6 text-center sm:pl-12 sm:pr-10 sm:pt-7">
        <h2 className="max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{body}</p>
        <TourCtaButton />
      </div>
      {discountTeaser}
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
 * Полосы туров "выбор персонажа" — равной ширины (без resize, чтобы не бросались в
 * глаза), по одной подсвечивается по очереди сама (лёгкая яркость + тонкая рамка),
 * ховер ставит на паузу и подсвечивает выбранную.
 */
function TourSelector({ tours }: { tours: typeof CATALOG_TOURS }) {
  // Было автопереключение по таймеру — убрано совсем (не только скорость/порядок
  // оказались не при чём: заголовок вроде "Северные острова" не помещался в узкую
  // колонку и обрезался посреди слова — см. break-words/line-clamp-2 на h3 ниже,
  // это была настоящая причина "отвратительно"). Осталась только подсветка по ховеру.
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="mt-4 flex h-72 w-full max-w-xl gap-1.5 sm:h-80 md:max-w-2xl lg:h-96 lg:max-w-4xl">
      {tours.map((tour, i) => {
        const isActive = i === active
        return (
          <Link
            key={tour.slug}
            href={`/tours/${tour.slug}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`group relative flex-1 overflow-hidden rounded-md bg-muted ring-1 transition-all duration-500 ease-out ${
              isActive ? "ring-primary/60" : "ring-white/10"
            }`}
          >
            <Image
              src={tour.imageSrc}
              alt={tour.title}
              fill
              sizes="(min-width: 1024px) 700px, (min-width: 640px) 400px, 60vw"
              className={`object-cover transition-[filter] duration-700 ease-out ${
                isActive ? "brightness-100" : "brightness-75"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
            <div
              className={`absolute inset-x-0 bottom-0 p-2.5 text-left transition-opacity duration-500 sm:p-3 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              <h3 className="line-clamp-2 font-heading text-sm leading-tight font-semibold break-words text-white sm:text-base">
                {tour.title}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug break-words text-white/80 sm:text-xs">
                {tour.annotation}
              </p>
            </div>
            {!isActive && (
              <>
                {/* Уже/lg колонка узкая — вертикальное название. С lg колонка
                    достаточно широкая для обычной горизонтальной подписи. */}
                <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-[11px] font-semibold text-white/90 [writing-mode:vertical-rl] lg:hidden">
                  {tour.title}
                </span>
                <div className="absolute inset-x-0 bottom-0 hidden p-3 text-left lg:block">
                  <h3 className="line-clamp-2 font-heading text-sm font-semibold break-words text-white/80">
                    {tour.title}
                  </h3>
                </div>
              </>
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
      <div className="flex flex-1 flex-col items-center overflow-y-auto pl-7 pr-5 pt-6 pb-6 text-center sm:pl-12 sm:pr-10 sm:pt-8">
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
  discountTeaser,
}: {
  title: string
  body: string
  quotes: Quote[]
  discountTeaser?: ReactNode
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div
        className={`relative flex flex-1 flex-col items-center overflow-y-auto pl-7 pr-5 pb-6 text-center sm:pl-12 sm:pr-10 ${discountTeaser ? "pt-16 sm:pt-20" : "pt-6 sm:pt-8"}`}
      >
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
      </div>
      {discountTeaser}
    </div>
  )
}

export function AdvantagesSection({
  heroQuotes,
  packageDiscounts,
}: {
  heroQuotes: Review[]
  packageDiscounts: Record<string, number>
}) {
  const discountTeaser = <DiscountTeaser packageDiscounts={packageDiscounts} />
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
          title="Что говорят гости, которые уже были с нами"
          body="Внимание к мелочам и забота о безопасности — вот что нам чаще всего пишут после поездки."
          quotes={heroQuotes.map(reviewToQuote)}
          discountTeaser={discountTeaser}
        />,
        <PhotoSlide
          key="company"
          title="Это ваш день, и в нём больше никого"
          body="Никто не опаздывает к автобусу и не тащит всех в дьюти-фри. Программа собрана под вашу компанию — от встречи в отеле до прощания вечером."
          imageSrc="/images/tours/mayak-dai-lan.jpg"
          imageAlt="Пляж у маяка Дай Лань, где кроме вас почти никого нет"
          discountTeaser={discountTeaser}
        />,
        <PhotoSlide
          key="pace"
          title="Ваш темп — а не расписание тургруппы"
          body="Никакой обязательной лавки, где гиду капает процент с покупок, и столовой по расписанию автобуса. Понравилось место — сидим сколько хочется, проголодались — просто скажите. Мы не гонимся за галочками в чек-листе: даём настоящую поездку — выверенную и профессиональную, но без туристической суеты и толпы."
          imageSrc="/images/tours/severnye-ostrova.jpg"
          imageAlt="Северные острова, тихая бухта в стороне от туристических троп"
          discountTeaser={discountTeaser}
        />,
      ]}
    />
  )
}

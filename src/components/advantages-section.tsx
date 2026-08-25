"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { SlideDeck } from "@/components/slide-deck"
import { PhotoStack } from "@/components/photo-stack"
import { cn } from "@/lib/utils"
import type { Review } from "@/lib/reviews-data"

// hint — только на последнем слайде (QuoteSlide): кнопка периодически
// мягко "моргает" (2 коротких пульса, потом пауза), приглашая нажать —
// после того как стрелки-подсказки не прижились, Виктор попросил вернуть
// кнопку к обычному виду и обойтись только этим морганием.
function TourCtaButton({ hint = false, spacious = false }: { hint?: boolean; spacious?: boolean }) {
  return (
    // Полностью full-width смотрелась плоской полосой, а узкий inline-fit
    // pill (прошлая правка) — наоборот мелко и невесомо (Виктор: "теперь
    // слишком узкая... верни почти по всей ширине и сделай жирнее"). w-[88%]
    // с max-w — компромисс: почти во всю ширину, но не край-в-край,
    // font-bold — визуально жирнее без роста высоты. py/text-size на sm+ НЕ
    // увеличивал (см. комментарий у IntroSlide про svh-бюджет без скролла) —
    // ширина и жирность шрифта дают "больше" без цены по высоте. w-full на
    // обёртке ОБЯЗАТЕЛЕН: родитель — flex-col с items-center (не stretch),
    // без явной ширины у обёртки её собственная ширина зависит от контента
    // (Link), а Link.width:88% — от ширины обёртки; проценты внутри
    // auto-sized контейнера резолвятся в auto (по спеке CSS), кнопка
    // схлопывалась до текста и переносилась на 2 строки.
    <div className={cn("relative flex w-full justify-center", spacious ? "mt-8 sm:mt-10" : "mt-4 sm:mt-6")}>
      <Link
        href="/tours"
        className={cn(
          "flex w-[88%] max-w-sm items-center justify-center rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-[0_10px_40px_-8px] shadow-primary/35 ring-1 ring-primary-foreground/10 transition-all hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/50 active:scale-[0.98] sm:max-w-lg sm:py-6 sm:text-xl",
          hint && "cta-invite-pulse",
        )}
      >
        Выбрать тур
      </Link>
    </div>
  )
}

const COLLAGE_PHOTO_COUNT = 67
// Бампнуть при любой замене/переименовании файлов в public/images/collage —
// имена файлов НЕ меняются при замене содержимого (collage-05.jpg остаётся
// collage-05.jpg, даже если внутри теперь другое фото после удаления одного
// и сдвига остальных), а браузер/CDN кэшируют статику из /public по URL без
// versioning. Без cache-bust'а на том же имени файла могла (по крайней мере
// теоретически) показываться старая закэшированная картинка вместо новой
// (Виктор: "все как надо кроме совпадения самих картинок" — не позиция,
// не тайминг, а именно контент не совпадает с ожидаемым).
const COLLAGE_CACHE_VERSION = 2
const COLLAGE_PHOTOS = Array.from(
  { length: COLLAGE_PHOTO_COUNT },
  (_, i) => `/images/collage/collage-${String(i + 1).padStart(2, "0")}.jpg?v=${COLLAGE_CACHE_VERSION}`,
)

// priming — плитка в сетке "подмигивает", пока полноразмерное фото грузится в фоне
// (устраняет мелькание предыдущего кадра) и даёт немного интриги перед раскрытием.
// Виктор попросил ускорить весь цикл моргание/раскрытие/закрытие на 5-10% —
// было 1000/3040/850/1000.
const PRIME_MS = 900
const HOLD_MS = 2800
const GAP_MS = 780
// Виктор: "фотка отображается по времени нормально" (HOLD_MS ок), "но сам
// процесс открытия чуть затянут" — именно transition (раскрытие/схлопывание),
// ещё -10% (было 900).
const TRANSITION_MS = 810
// Пауза перед самым первым раскрытием в каждой полосе — уже ПОСЛЕ того, как
// вся мозаика прогрузилась (см. ready в useRevealCycle), даём картинке
// просто спокойно постоять секунду-другую, прежде чем начнётся моргание
// (Виктор: "после загрузки пусть чуть-чуть перед морганием будет пауза").
// Ускорена на 15% (было 2000) — Виктор: "слишком длинная пауза".
const INITIAL_GAP_MS = 1700

function shuffledIndices(count: number) {
  const arr = Array.from({ length: count }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Плитки — квадраты (aspect-square), значит блок коллажа целиком выходит
// квадратным, только если строк РОВНО столько же, сколько колонок (иначе
// прямоугольник cols×rows плиток при равной стороне плитки). Раньше строки
// подбирались отдельно от колонок под высотный бюджет (8 кол.×6 строк на
// базе, 9×4 на sm, 12×3 на lg) — коллаж был явно шире, чем выше (Виктор:
// "сам коллаж с фотографиями не квадратный... мне нужен квадратный именно").
// Теперь строки == колонки на каждом брейкпоинте, а сам контейнер —
// aspect-square (см. className на обёртке ниже). На мобиле ширина = вся
// ширина слайда, высота производная (квадрат на всю ширину — Виктор: "на
// телефонах квадрат должен быть по всей ширине"); с sm и выше наоборот —
// высота в svh (бюджет под кнопку), ширина производная.
// Было 6×6/7×7/8×8 по брейкпоинтам — Виктор увидел на мобиле 6×6 и
// попросил 8×8 везде ("фоток стало мало"). Теперь одна плотность на всех
// брейкпоинтах — из 67 фото показываем 64, 3 всегда скрыты (не влезают
// в квадрат 8×8).
const VISIBLE_AT_BASE = 8 * 8
const VISIBLE_AT_SM = 8 * 8
const VISIBLE_AT_LG = 8 * 8

// Раньше (прямоугольная сетка) большие брейкпоинты показывали МЕНЬШЕ плиток,
// чем база (8×6=48 на базе против 12×3=36 на lg) — колонок больше, но строк
// меньше под высотный бюджет. При cols===rows (квадрат) всё наоборот: чем
// больше колонок, тем больше и строк — lg показывает БОЛЬШЕ плиток (64), чем
// sm (49) и база (36), т.е. каждый следующий брейкпоинт — надмножество
// предыдущего, а не подмножество.
function tileVisibilityClass(i: number) {
  if (i >= VISIBLE_AT_LG) return "hidden"
  if (i >= VISIBLE_AT_SM) return "hidden lg:block"
  if (i >= VISIBLE_AT_BASE) return "hidden sm:block"
  return ""
}

function visibleCountForWidth(width: number) {
  if (width >= 1024) return VISIBLE_AT_LG
  if (width >= 640) return VISIBLE_AT_SM
  return VISIBLE_AT_BASE
}

function gridColsForWidth(width: number) {
  if (width >= 1024) return 8
  if (width >= 640) return 8
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

// Полоса раскрытия — теперь квадрат (aspect-square в BAND_LAYOUT, не
// inset-y-0 на всю высоту), а не вертикальная во всю высоту контейнера
// (Виктор: "чтобы, когда фотка открывалась, был квадрат"). Ширина полосы в
// плитках (end-start) равна её высоте в плитках (плитки квадратные, сама
// полоса тоже квадратная — значит высота в плитках совпадает с шириной),
// отцентрована по вертикали (top-1/2 -translate-y-1/2 в BAND_LAYOUT) — тут
// тот же диапазон строк, только по вертикали, чтобы currentPool ниже мог
// выбирать плитки ТОЛЬКО из тех, что реально попадают в квадрат полосы
// (иначе моргнувшая где-то в углу сетки плитка окажется физически ВНЕ
// центрированного квадрата, и рост "оторвётся" от её настоящего места).
function bandRowRange(bandIndex: number, bandCount: number, cols: number, rows: number): [number, number] {
  const [start, end] = bandColumnRange(bandIndex, bandCount, cols)
  const span = end - start
  const rowStart = Math.floor((rows - span) / 2)
  return [rowStart, rowStart + span]
}

// Позиция и ширина полосы i из N — те же трети/половины, что и в CSS-классах
// BAND_LAYOUT ниже (держать в синхроне вручную, т.к. Tailwind-классы должны
// быть статичными строками для сборки). z-20 обязателен: ни .grid, ни внешний
// контейнер коллажа не создают свой stacking context (нет z-index/transform), так
// что z-10 у "приподнятой" плитки внутри сетки иначе всплывает выше полосы
// раскрытия (сравнение идёт не по DOM-порядку, а по z-index — 10 > auto).
const BAND_LAYOUT = [
  "absolute top-1/2 left-0 z-20 aspect-square w-full -translate-y-1/2 overflow-hidden pointer-events-none sm:w-1/2 lg:w-1/3",
  "absolute top-1/2 z-20 hidden aspect-square w-1/2 -translate-y-1/2 overflow-hidden pointer-events-none sm:left-1/2 sm:block lg:left-1/3 lg:w-1/3",
  "absolute top-1/2 z-20 hidden aspect-square -translate-y-1/2 overflow-hidden pointer-events-none lg:left-2/3 lg:block lg:w-1/3",
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
//
// getOrigin(idx) — точка роста считается ИЗМЕРЕНИЕМ реального DOM (см.
// makeGetOrigin в PhotoCollage), а не арифметикой по cols/rows. Раньше origin
// вычислялся ЧИСТО в цифрах (idx % cols, bandColumnRange...), в предположении,
// что эти числа всегда совпадают с тем, что реально отрисовал CSS grid —
// именно это и было источником "открывается не та плитка": оба места (Tailwind
// grid-cols-* и JS-константы gridColsForWidth/bandColumnRange) приходилось
// вручную держать в синхроне (см. комментарий у BAND_LAYOUT), и любое малейшее
// расхождение (например, между JS-снятым window.innerWidth в момент выбора
// плитки и тем, что браузер реально отрендерил через media query) сдвигало
// точку раскрытия на соседнюю плитку/колонку. Измерение через
// getBoundingClientRect устраняет этот класс багов в принципе — раскрытие
// физически не может разъехаться с плиткой, потому что берёт координаты
// напрямую из уже отрисованного макета.
type Measurement = { origin: string; scaleX: number; scaleY: number }

function useRevealCycle(bandIndex: number, measure: (idx: number) => Measurement, ready: boolean) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [target, setTarget] = useState(0)
  const [origin, setOrigin] = useState("50% 50%")
  const [closedScale, setClosedScale] = useState({ x: 0.15, y: 0.15 })
  // Вызывается из onLoad самого band-<Image> (см. PhotoCollage) — сигнал, что
  // ИМЕННО тот файл, который реально покажется крупно (Next-оптимизированный
  // вариант конкретной ширины/качества у band, а не сырой файл), уже отрисован
  // браузером. См. комментарий у Promise.race ниже — раньше готовность
  // проверялась через preloadImage сырого файла не через тот URL/размер,
  // который в итоге запрашивает сам <Image> у band.
  const bandLoadResolveRef = useRef<(() => void) | null>(null)
  const notifyBandLoaded = useCallback(() => {
    bandLoadResolveRef.current?.()
  }, [])

  useEffect(() => {
    // Не стартуем раскрытие, пока мозаика сама ещё не прогрузилась целиком —
    // Виктор: одна плитка раскрывалась крупно поверх сетки, пока остальные
    // плитки ещё были плейсхолдерами, выглядело как два конкурирующих слоя.
    // Эффект просто перезапустится сам, когда ready станет true (см. deps).
    if (!ready) return
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
      const [colStart, colEnd] = bandColumnRange(bandIndex, bandCount, cols)
      const [rowStart, rowEnd] = bandRowRange(bandIndex, bandCount, cols, rows)
      const visibleCount = cols * rows
      // Фильтр и по колонке, и по строке — полоса раскрытия теперь квадрат,
      // отцентрованный по вертикали (см. bandRowRange), а не вся высота
      // сетки, так что раскрыться физически может только та плитка, что
      // реально попадает в этот квадрат.
      const pool = Array.from({ length: visibleCount }, (_, i) => i).filter((i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        return col >= colStart && col < colEnd && row >= rowStart && row < rowEnd
      })
      return { pool }
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
      const m = measure(idx)
      // Слушатель ставим ДО setTarget — src у band-<Image> меняется этим же
      // рендером, событие onLoad может прийти очень быстро (или из кэша
      // браузера почти мгновенно), листенер должен быть готов заранее.
      const bandLoaded = new Promise<void>((resolve) => {
        bandLoadResolveRef.current = resolve
      })
      setTarget(idx)
      setOrigin(m.origin)
      setClosedScale({ x: m.scaleX, y: m.scaleY })
      setPhase("priming")
      // Ждём РЕАЛЬНУЮ загрузку того файла, который покажет band (см. onLoad на
      // band-<Image> в PhotoCollage) — раньше ждали preloadImage(сырой файл),
      // а band рендерит через Next/Image, у которого совсем другой URL
      // (/_next/image?url=...&w=...&q=...). На медленной сети сырой файл мог
      // догрузиться, пока Next-вариант ещё не запросился/не отрисовался —
      // раскрытие стартовало раньше реальной смены картинки: "моргнула одна
      // плитка, открылась другая" (Виктор). onLoad — событие ИМЕННО того
      // элемента, который вот-вот станет видимым. Promise.race с таймаутом —
      // подстраховка: если тот же idx выпадет два цикла подряд (на границе
      // перетасовки), src не меняется, onLoad повторно не придёт вообще.
      const bandLoadedOrTimeout = Promise.race([bandLoaded, wait(3000)])
      Promise.all([bandLoadedOrTimeout, wait(PRIME_MS)]).then(() => {
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

    // Полосы стартуют со сдвигом по фазе (треть полного цикла на каждую) —
    // без этого все bandIndex запускают свой самый первый runCycle через
    // одинаковый INITIAL_GAP_MS, а дальше цикл целиком детерминирован (одни
    // и те же PRIME_MS/HOLD_MS/TRANSITION_MS/GAP_MS у всех полос, bandLoaded
    // почти всегда резолвится мгновенно из кэша) — три полосы навсегда
    // остаются в одной фазе и открываются/закрываются синхронно. На lg это
    // выглядело как "вся мозаика разом превращается в 3 одинаковых крупных
    // фото" вместо независимого поочерёдного раскрытия то тут, то там
    // (Виктор: "не сделать одинаковые... фотографии", "не видно, какие из
    // них моргают" — на самом деле все три моргали и раскрывались синхронно).
    const CYCLE_MS = PRIME_MS + HOLD_MS + TRANSITION_MS + GAP_MS
    const phaseOffset = (bandIndex * CYCLE_MS) / 3
    after(runCycle, INITIAL_GAP_MS + phaseOffset)
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [bandIndex, measure, ready])

  return { phase, target, origin, closedScale, notifyBandLoaded }
}

// Плитки грузятся строго по порядку слева направо/сверху вниз, если просто
// положиться на onLoad каждой <Image> — браузер и так тянет их по DOM-порядку
// (плюс priority у первых усугублял это), и коллаж "дочерчивался" по рядам, а
// не собирался как пазл (Виктор дважды: "видно, что страница грузится",
// "чтобы как будто из пазла собирали"). Реальную загрузку каждой картинки
// (<Image onLoad>) больше не используем для показа — вместо этого сами гоним
// перемешанный порядок через preloadImage (см. эффект ниже).
//
// ВАЖНО: preloadImage запускаются пулом из COLLAGE_CONCURRENCY одновременных
// загрузок (не await в цикле по одному — так было в первой версии, коллаж
// из-за этого не показывался очень долго: Виктор "открыл — долго ничего не
// грузится"; и не все 65 сразу без лимита — так было во второй версии, но на
// медленной мобильной сети (49 КБ/с) 65 параллельных запросов делят между
// собой один и тот же узкий канал, и ни один не доходит быстро — тот же
// эффект, просто по другой причине: Виктор снова "фотки грузятся очень
// долго"). Пул — как только одна картинка пришла, тут же стартует следующая,
// но одновременно активно не больше COLLAGE_CONCURRENCY запросов. Задержка
// на каждую плитку — чисто визуальная (для темпа появления), включается
// ПОСЛЕ того, как картинка реально пришла.
const TILE_FADE_MS = 260
const TILE_STAGGER_MS = 30
// 6 -> 8 — Виктор попросил быстрее. Не поднимал сильно выше: раньше уже
// было "без лимита" (65 параллельных) и на медленной мобильной сети все
// делили один и тот же узкий канал, ни один не доходил быстро (см.
// комментарий выше) — с 64 фото вместо 67 общий трафик и так меньше.
const COLLAGE_CONCURRENCY = 8

// Раньше была ещё крупная "hero"-плитка на всю область поверх сетки, пока
// сетка грузится (заглушка на время загрузки) — Виктор: одна фотка держится
// крупно, а раскрытие (см. useRevealCycle ниже) уже открывает поверх нее
// другую плитку, до того как основная мозаика вообще успела прогрузиться —
// "не красиво". Убрано: пока сетка не набрала все плитки, показываем только
// плейсхолдеры (bg-white/15 pulse), без отдельного крупного фото поверх.
// gridReady — сигнал для useRevealCycle (см. ready ниже): раскрытие плиток
// начинается только после того, как вся мозаика уже видна целиком, не раньше.
function PhotoCollage() {
  const [loadedTiles, setLoadedTiles] = useState<Set<number>>(() => new Set())
  const markLoaded = useCallback((i: number) => {
    setLoadedTiles((prev) => (prev.has(i) ? prev : new Set(prev).add(i)))
  }, [])
  // VISIBLE_AT_LG (не COLLAGE_PHOTO_COUNT) — теперь одна плотность на всех
  // брейкпоинтах (8×8=64 из 67), а preloadImage ниже грузит именно эти 64:
  // сравнивать готовность с полными 67 значило бы никогда не стать true.
  const gridReady = loadedTiles.size >= VISIBLE_AT_LG

  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    // Грузим только те 64, что реально показываются (см. VISIBLE_AT_LG) —
    // 3 всегда скрытых фото раньше тоже качались впустую.
    const order = shuffledIndices(VISIBLE_AT_LG)
    let next = 0
    let done = 0
    const runNext = () => {
      if (cancelled || next >= order.length) return
      const idx = order[next]
      next += 1
      preloadImage(COLLAGE_PHOTOS[idx]).then(() => {
        if (cancelled) return
        const i = done
        done += 1
        timers.push(setTimeout(() => !cancelled && markLoaded(idx), i * TILE_STAGGER_MS))
        runNext()
      })
    }
    for (let k = 0; k < COLLAGE_CONCURRENCY; k++) runNext()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [markLoaded])

  // Реальные DOM-узлы плиток и полос — источник истины для origin (см.
  // makeGetOrigin ниже). tileRefs держит саму map между рендерами (не влияет на
  // рендер сам по себе, поэтому обычный useRef, а не state).
  const tileRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const bandRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  // Координаты точки роста — измерением реального расположения плитки
  // относительно её полосы (getBoundingClientRect), а не арифметикой по
  // cols/rows/брейкпоинтам. Пустые deps: функция читает .current в момент
  // вызова, ей нечему устаревать — но её identity ОБЯЗАНА быть стабильной
  // между рендерами, иначе useEffect в useRevealCycle (у него getOrigin в
  // deps) перезапускался бы на каждый ре-рендер и сбрасывал весь цикл.
  // Возвращает не только точку роста, но и closedScale — реальное отношение
  // размера плитки к размеру полосы (по каждой оси отдельно, плитка квадратная,
  // а полоса обычно нет). Раньше "закрытый" размер был захардкожен как
  // scale(0.15) для любой полосы и разрешения — не совпадало с фактическим
  // размером плитки, и раскрытие визуально стартовало не с её места и не с её
  // формы (Виктор: "и открывается не из того же [места]"). scale(scaleX,
  // scaleY) с этим же transformOrigin в закрытом виде даёт прямоугольник
  // ТОЧНО размера и формы плитки, поверх неё — расти уже физически некуда,
  // кроме как из её собственных границ.
  const measureOrigin = useCallback((bandIndex: number, idx: number) => {
    const tile = tileRefs.current.get(idx)
    const band = bandRefs[bandIndex].current
    if (!tile || !band) return { origin: "50% 50%", scaleX: 0.15, scaleY: 0.15 }
    const tileRect = tile.getBoundingClientRect()
    const bandRect = band.getBoundingClientRect()
    const originX = ((tileRect.left + tileRect.width / 2 - bandRect.left) / bandRect.width) * 100
    const originY = ((tileRect.top + tileRect.height / 2 - bandRect.top) / bandRect.height) * 100
    return {
      origin: `${originX}% ${originY}%`,
      scaleX: tileRect.width / bandRect.width,
      scaleY: tileRect.height / bandRect.height,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bandRefs — массив useRef, стабилен между рендерами
  }, [])
  const measure0 = useCallback((idx: number) => measureOrigin(0, idx), [measureOrigin])
  const measure1 = useCallback((idx: number) => measureOrigin(1, idx), [measureOrigin])
  const measure2 = useCallback((idx: number) => measureOrigin(2, idx), [measureOrigin])

  // Три параллельных цикла (по числу полос на самом широком брейкпоинте — lg),
  // каждый на своём брейкпоинте либо активен (своя полоса колонок), либо просто
  // ждёт (bandIndex >= bandCountForWidth). Хуков всегда ровно 3 — иначе нарушится
  // React Rules of Hooks при смене ширины окна.
  const reveals = [
    useRevealCycle(0, measure0, gridReady),
    useRevealCycle(1, measure1, gridReady),
    useRevealCycle(2, measure2, gridReady),
  ]
  const activeByTile = new Map(reveals.filter((r) => r.phase !== "idle").map((r) => [r.target, r]))

  return (
    // aspect-square — коллаж всегда квадрат (Виктор: "коллаж не
    // квадратный... мне нужен именно квадратный"). На мобиле (< sm) —
    // квадрат НА ВСЮ ШИРИНУ слайда (Виктор: "на телефонах квадрат должен
    // быть по всей ширине"), высота производная = ширине экрана — шире,
    // чем было (раньше 6 строк без фиксированной высоты, ~0.75×ширины), но
    // это прямое следствие требования "по всей ширине". С sm и выше —
    // наоборот: высота фиксирована в svh (тот же бюджет, что уже подобран
    // под кнопку "Выбрать тур" на десктопе/планшете), ширина производная
    // (self-center нужен, иначе родитель-flex со stretch по умолчанию всё
    // равно растянул бы на всю ширину) — на широких коротких окнах именно
    // высота была тесным местом (кнопка уезжала за экран), не ширина.
    <div className="relative aspect-square w-full shrink-0 overflow-hidden sm:h-[38svh] sm:w-auto sm:self-center lg:h-[32svh]">
      <div className="grid w-full grid-cols-8">
        {COLLAGE_PHOTOS.map((src, i) => {
          const isPriming = activeByTile.get(i)?.phase === "priming"
          return (
            <div
              key={src}
              ref={(el) => {
                if (el) tileRefs.current.set(i, el)
                else tileRefs.current.delete(i)
              }}
              className={`relative aspect-square overflow-hidden ${tileVisibilityClass(i)} ${
                isPriming ? "tile-priming" : ""
              } ${loadedTiles.has(i) ? "" : "animate-pulse bg-white/15"}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 8vw, (min-width: 640px) 11vw, 12.5vw"
                className="object-cover"
                style={{
                  opacity: loadedTiles.has(i) ? 1 : 0,
                  transition: `opacity ${TILE_FADE_MS}ms ease-out`,
                }}
              />
            </div>
          )
        })}
      </div>
      {/* Раскрытие "на весь блок" (Виктор: "должны раскрываться на весь размер
          блока") — своя полоса колонок на каждый цикл (BAND_LAYOUT), фото внутри
          неё растёт от той же точки, где моргнула плитка (см. origin), пока не
          займёт всю полосу целиком, и так же стягивается обратно.

          closedScale (см. measureOrigin) — реальное отношение размера плитки к
          размеру полосы по каждой оси, не константа. Раньше тут был захардкожен
          scale(0.15) для любой полосы/ширины экрана, что почти никогда не
          совпадало с истинным размером плитки — рост стартовал (и стягивание
          заканчивалось) в прямоугольнике неправильного размера/формы, чуть в
          стороне от настоящей плитки (Виктор: "открывается не из того же
          [места], и закрывается не в то же самое место"). scale(scaleX, scaleY)
          с тем же transformOrigin в закрытом состоянии даёт прямоугольник ТОЧНО
          размера и формы плитки — расти/схлопываться уже физически некуда мимо
          неё самой.

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
          <div key={b} ref={bandRefs[b]} className={BAND_LAYOUT[b]}>
            <div
              className="absolute inset-0"
              style={{
                transformOrigin: reveal.origin,
                transform: open ? "scale(1)" : `scale(${reveal.closedScale.x}, ${reveal.closedScale.y})`,
                opacity: rendered ? 1 : 0,
                transitionProperty: "transform",
                transitionTimingFunction: "ease-out",
                transitionDuration: `${TRANSITION_MS}ms`,
                boxShadow: rendered ? "0 20px 45px -12px rgba(0,0,0,0.55)" : undefined,
              }}
            >
              <Image
                src={COLLAGE_PHOTOS[reveal.target]}
                alt=""
                fill
                sizes={BAND_SIZES[b]}
                className="object-cover"
                onLoad={reveal.notifyBandLoaded}
              />
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
      {/* justify-[safe_center] (не просто justify-center) — на высоких экранах
          центрирует текст+кнопку в оставшемся месте под коллажем (Виктор с
          iPhone: верхние слайды торчали заголовком, пустота внизу вместо
          адаптации по высоте). Обычный justify-center на НИЗКИХ/landscape
          экранах наоборот обрезал бы верх контента, если он не влезает —
          safe откатывается к выравниванию по началу и обычному скроллу
          вместо обрезания, когда контент не помещается. */}
      {/* Виктор: "заголовок Приватный Вьетнам убрать... текст попроще,
          крупнее в пару раз, чтобы всё считывалось за раз". Убрал h1 и
          старый 5-предложный абзац целиком — бывший accent-подзаголовок
          стал единственным (крупным) заголовком, тело — одна короткая
          строка вместо абзаца. Меньше текста и крупнее шрифт одновременно
          решают и жалобу на объём, и жалобу на "не влезло" (высота вниз
          от коллажа освобождается). text-center и leading-snug — как
          были. */}
      <div className="flex flex-1 flex-col items-center justify-[safe_center] overflow-y-auto px-4 pt-3 pb-2 text-center sm:px-11 sm:pt-7">
        <h1 className="max-w-xl font-heading text-3xl leading-[1.1] font-semibold sm:text-5xl">
          Каждый выезд тщательно продуман
        </h1>
        {/* Виктор: не "никого лишнего рядом" (слишком прямолинейно) - мягче,
            через "только для вас". "гид" -> "вожатый (гид)" - его термин,
            использовать так везде на сайте (см. ValuesSlide/reviewToQuote
            ниже). Плюс явно про доверие/безопасность/продуманность -
            "коротко, круто, но чуть-чуть побольше". */}
        <p className="mt-2 max-w-md text-base leading-snug text-muted-foreground sm:mt-4 sm:max-w-xl sm:text-xl">
          Премиальные авто и вожатый (гид), которому по-настоящему можно доверять. Маршрут
          продуман и безопасен от начала до конца - эта поездка только для вас.
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
      {/* min(%, Nsvh) — на низких широких окнах (десктоп/ноутбук) % от
          высоты слайда даёт зону фото ощутимо выше, чем остаётся места под
          заголовок+текст+кнопку (тот же текст на высоком узком мобильном
          экране умещался: там % и так был небольшим в пикселях). Без
          верхнего предела в svh кнопка "Выбрать тур" уезжала за нижний край
          окна на широких экранах (Виктор: "кнопки не влазят на широкой
          вёрстки"). PhotoCollage на IntroSlide уже ограничен похожим
          образом (см. sm:h-[38svh] lg:h-[32svh]) — тут та же идея. Бюджет
          увеличен ещё раз (было 48%/50%/46%) — Виктор попросил фото ещё
          крупнее; текст под фото короткий, места хватает. 56% на мобиле
          уже обрезало кнопку (проверено скриншотом) — 52% предел, при
          котором кнопка ещё полностью видна. */}
      <div className="relative h-[52%] shrink-0 sm:h-[min(52%,42svh)] lg:h-[min(48%,38svh)]">
        {stackImages && stackImages.length > 1 ? (
          // Виктор сначала просил альбомную раму (не квадратную), потом
          // передумал — снова квадрат, но крупнее. Источники сами по себе
          // 1:1 (см. комментарий в истории задач), object-cover на всю
          // рамку в PhotoStack тут просто не обрезает лишнего.
          <div className="mx-auto aspect-square h-full w-auto p-3 pb-6 sm:p-5 sm:pb-8">
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
      {/* px-4 + max-w-full на теле (не px-6/max-w-sm) — тот же приём "текст
          на всю ширину", что уже на IntroSlide (Виктор: "на втором и на
          третьем слайде где текст причеши" — привёл в соответствие). */}
      <div className="flex flex-1 flex-col items-center justify-[safe_center] overflow-y-auto px-4 pt-4 pb-5 text-center sm:px-11 sm:pt-7">
        <h2 className="max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {title}
        </h2>
        {accent && (
          <p className="mt-2 max-w-md text-base leading-snug font-medium text-foreground sm:mt-3 sm:max-w-xl sm:text-xl">
            {accent}
          </p>
        )}
        <p className="mt-2 max-w-full text-base leading-snug text-muted-foreground sm:max-w-xl sm:text-xl sm:leading-relaxed">
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
// Длительность одного круга машинки по дороге — синхронна с animateMotion,
// который тут раньше был (см. useVanOnRoad).
const VAN_DURATION_MS = 22000
// Виктор: "машинку на заднем фоне тоже можно увеличить" — домножается на
// scale в transform ниже (сама форма машинки в JSX остаётся в тех же
// координатах, масштаб только визуальный).
const VAN_SCALE = 1.5

// SMIL rotate="auto" крутил машинку СТРОГО по касательной — на разворотах
// серпантина касательная временами смотрела влево (dx<0), и разворот на
// ~180° от "носом вправо" временно показывал её вверх колёсами (Виктор:
// "едет вниз головой"). Штатная попытка это исправить — вообще убрать
// поворот — тоже не понравилась ("было лучше, надо было наоборот
// отражение"): машинка должна КРЕНИТЬСЯ в повороты, а не просто ехать
// плашмя. Правильный приём (как в 2D-играх у спрайтов персонажа) — вместо
// вращения через "спину" на развороте ЗЕРКАЛИМ машинку по горизонтали:
// поворот всегда считается от |dx| (что даёт угол строго в [-90°, 90°],
// физически не может перевернуть), а если реальный dx отрицательный — весь
// уже повёрнутый силуэт отражаем scale(-1,1), как будто смотрим на неё с
// другого борта дороги. Из-за зеркала это не SMIL-анимация (mpath/rotate не
// умеют так) — здесь ручной rAF-луп поверх getPointAtLength той же кривой.
function useVanOnRoad(roadRef: RefObject<SVGPathElement | null>, vanRef: RefObject<SVGGElement | null>) {
  useEffect(() => {
    const road = roadRef.current
    const van = vanRef.current
    if (!road || !van) return
    const total = road.getTotalLength()
    const step = Math.max(0.5, total * 0.006)
    let raf = 0
    let start: number | null = null
    const frame = (ts: number) => {
      if (start === null) start = ts
      const t = ((ts - start) % VAN_DURATION_MS) / VAN_DURATION_MS
      const len = t * total
      const p0 = road.getPointAtLength(len)
      const p1 = road.getPointAtLength(Math.min(total, len + step))
      const dx = p1.x - p0.x
      const dy = p1.y - p0.y
      const mirrored = dx < 0
      const angle = (Math.atan2(dy, Math.abs(dx) || 0.0001) * 180) / Math.PI
      van.setAttribute(
        "transform",
        `translate(${p0.x} ${p0.y}) scale(${mirrored ? -VAN_SCALE : VAN_SCALE},${VAN_SCALE}) rotate(${angle})`,
      )
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [roadRef, vanRef])
}

function ValuesSlide({
  title,
  points,
}: {
  title: string
  points: { title: string; body: string }[]
}) {
  const roadPathRef = useRef<SVGPathElement>(null)
  const vanGroupRef = useRef<SVGGElement>(null)
  useVanOnRoad(roadPathRef, vanGroupRef)

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* px-4 (не px-6) — тот же приём "причесать текст", что уже на первых
          трёх слайдах (Виктор: "и на четвёртом слайде тоже"). max-w-md ->
          sm:max-w-lg — на широком экране колонка с дорогой/пунктами была
          той же фиксированной ширины, что и на телефоне, хотя места вокруг
          явно больше. */}
      <div className="flex flex-1 flex-col items-center justify-[safe_center] overflow-y-auto px-4 py-6 text-center sm:px-11">
        <h2 className="max-w-xl font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          {title}
        </h2>
        <div className="relative mt-6 w-full max-w-md sm:max-w-lg">
          {/* Слайд без фото — вместо статичной картинки едет микроавтобус по
              вьющейся дороге (Виктор: "не кружочек, а машинка... микроавтобус,
              туристы едут куда-то"). Дорога больше не жмётся к колонке цифр
              (было x=[5,9]) — виляет по всей ширине блока (x от 22 до 78),
              так что проходит и мимо цифр, и заходит фоном под текст, а не
              только вдоль левого края (Виктор: "не только через цифры,
              вокруг текста ехала"). Разметка — та же кривая вторым, тонким
              пунктирным штрихом поверх (Виктор: "дорогу — на разметку").
              Пальмы вдоль обочины — чисто декоративные <use> одного и того же
              контура, без анимации, поярче обычного фона (Виктор: "пальмы
              чуть поярче"). У машинки крутятся колёса (свой animateTransform
              на каждом, независимо от скорости по дороге) — Виктор: "а то
              странно смотреться будет", если едет, а колёса стоят. Кузов
              почти прямоугольный (rx маленький, не "таблетка") и с полосой
              окон почти во всю длину борта — Виктор: "видно, что прям
              газелька", силуэт-пилюля без окон читался слишком абстрактно.
              Машинка крутится по касательной к дороге, но не через SMIL
              rotate="auto" — тот на разворотах серпантина временами крутил
              её вверх колёсами (см. useVanOnRoad выше: там же зеркалирование
              вместо разворота "через спину"). Скорость — 22s, помедленнее
              прежних 14s (Виктор после первой версии: "помедленнее").
              preserveAspectRatio="xMidYMid meet" (не "none") — контейнер
              высотой подстраивается под текст рядом, его пропорции не
              совпадают с viewBox (100:260), а "none" растягивал/сжимал
              дорогу и машинку неравномерно по X/Y на каждом устройстве
              (Виктор с iPhone: "растягивается в ширину, некрасиво"). Сначала
              пробовал "slice" — сохраняет форму, но ОБРЕЗАЕТ края SVG по
              контейнеру, а машинка ездит по ВСЕЙ высоте viewBox (y от 0 до
              258) — верх/низ пути срезались, машинка подолгу укатывала в
              обрезанную часть и казалось, что проехала один раз и встала
              (Виктор: "проезжает только 1 раз"). "meet" вписывает viewBox
              ЦЕЛИКОМ (с пустыми полями по бокам вместо обрезки) — путь и
              машинка видны всегда, весь цикл. */}
          <svg
            aria-hidden
            viewBox="0 0 100 260"
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full text-primary"
          >
            <path
              ref={roadPathRef}
              id="values-road-path"
              d="M50,0 C78,15 78,35 78,50 C78,68 22,80 22,95 C22,110 78,122 78,135 C78,155 22,165 22,180 C22,197 78,207 78,220 C78,235 50,248 50,258"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="2"
            />
            <path
              d="M50,0 C78,15 78,35 78,50 C78,68 22,80 22,95 C22,110 78,122 78,135 C78,155 22,165 22,180 C22,197 78,207 78,220 C78,235 50,248 50,258"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="0.5"
              strokeDasharray="3 3"
            />
            <g id="values-palm-tree" opacity="0.32">
              <path d="M0,0 C-0.5,-3 0.5,-6 0,-9" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M0,-9 C-3,-10.5 -4.5,-8.5 -5,-6.5" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M0,-9 C2.5,-11 4.5,-9.5 5.5,-7.5" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M0,-9 C-1.5,-12 -1,-14.5 0.5,-16" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M0,-9 C1.5,-12 3.5,-13 5,-12.5" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
            </g>
            <use href="#values-palm-tree" x="84" y="46" />
            <use href="#values-palm-tree" x="16" y="93" />
            <use href="#values-palm-tree" x="16" y="178" />
            <use href="#values-palm-tree" x="84" y="216" />
            <g>
              {/* Позицию/поворот/зеркало считает useVanOnRoad (см. выше) —
                  transform на этом <g> проставляется через JS каждый кадр,
                  здесь только сама форма машинки в её "домашней" ориентации
                  (нос вправо, при повороте 0° и без зеркала). */}
              <g ref={vanGroupRef}>
                {/* Колёса — тёмная заливка (не currentColor), иначе сливаются
                    с кузовом того же оттенка и на маленьком масштабе
                    выглядят просто пятном, а не колесом. */}
                <g transform="translate(-3.8,2.8)">
                  <circle r="1.7" fill="#111827" />
                  <g>
                    <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="#9ca3af" strokeWidth="0.5" />
                    <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="#9ca3af" strokeWidth="0.5" />
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.35s" repeatCount="indefinite" />
                  </g>
                </g>
                <g transform="translate(3.8,2.8)">
                  <circle r="1.7" fill="#111827" />
                  <g>
                    <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="#9ca3af" strokeWidth="0.5" />
                    <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="#9ca3af" strokeWidth="0.5" />
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.35s" repeatCount="indefinite" />
                  </g>
                </g>
                {/* Почти прямоугольный кузов (rx 1, не "таблетка") + полоса
                    окон почти во всю длину борта — "видно, что прям
                    газелька", силуэт-пилюля без окон читался слишком
                    абстрактно. Лобовое стекло у правого (переднего в
                    "домашней" ориентации) края. */}
                <rect x="-6.8" y="-3.2" width="13.6" height="6" rx="1" fill="currentColor" />
                <rect x="-5.6" y="-2.2" width="10.6" height="1.7" rx="0.4" fill="#111827" opacity="0.4" />
                <rect x="3" y="-2.1" width="3.4" height="4.2" rx="0.5" fill="#111827" opacity="0.5" />
              </g>
            </g>
          </svg>
          <div className="relative z-10 space-y-5 text-left">
            {points.map((point, i) => (
              <div key={point.title} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-base font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold sm:text-xl">{point.title}</h3>
                  <p className="mt-0.5 text-base text-muted-foreground sm:text-lg">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <TourCtaButton />
      </div>
    </div>
  )
}

// Северные острова убраны из подборки (Виктор: небезопасный и неидеальный
// маршрут) — осталось ровно 4 программы, см. ToursSlide ниже про новую
// концепцию (не "отбор из многих", а намеренно узкий список).
const CATALOG_TOURS = [
  {
    slug: "hon-tam",
    title: "Хон Там",
    imageSrc: "/images/tours/hon-tam.jpg",
    annotation: "Ближайший остров без долгих переходов по открытой воде - спокойно даже с детьми.",
  },
  {
    slug: "mayak-dai-lan",
    title: "Маяк Дай Лань",
    imageSrc: "/images/tours/mayak-dai-lan.jpg",
    annotation: "Дикий пляж, но дорога туда - только проверенная, без решений на ходу.",
  },
  {
    slug: "nyachang-avtorskiy",
    title: "Авторский Нячанг",
    imageSrc:
      "https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/nyachang-avtorskiy-b2ZHevFPr4gfLIEw3aV2oZPHvsRbs9.jpg",
    annotation: "Один гид и один водитель весь день - рядом с вами никого чужого.",
  },
  {
    slug: "dalat-2-dnya",
    title: "Далат, 2 дня",
    imageSrc: "/images/tours/dalat-2-dnya.jpg",
    annotation:
      "Не однодневный марш-бросок в горы: два спокойных дня, а вечер в городе - под присмотром, не самостоятельная прогулка.",
  },
]

// Было "горной" волной (пик в центре) — рассчитано на нечётное число
// карточек (5), с чётным (4, после того как убрали "Северные острова")
// центрального пика нет и ряд съезжал в одну сторону несимметрично
// (Виктор: "чётное количество, это расположение не идёт"). Шахматное
// чередование низкая/высокая работает для любого чётного количества.
const STAGGER = ["", "mt-4", "", "mt-4"]

/**
 * Полосы туров "выбор персонажа" — разноуровневый ряд, ховер (десктоп) чуть
 * приподнимает тенью. Подпись — ПОД картинкой, не поверх неё: раньше текст
 * поверх фото либо обрезался (line-clamp), либо терялся на светлом фото
 * при любой технике контраста (тень/плашка) — Виктор много раз забраковал
 * оба варианта. Подпись снаружи фото решает это раз и навсегда — полный
 * текст, без ограничения по высоте. Коннектор — тонкая линия с точкой
 * (не иконка-стрелка, которую Виктор посчитал слишком прямолинейной).
 */
// Длительность "моргания" одной карточки — совпадает с CSS-анимациями
// .tour-priming/.tour-caption-blinking в globals.css (0.9s). GAP — пауза
// МЕЖДУ карточками в течение одного прохода (Виктор попросил помягче и
// пореже после первой версии — было 650мс с полноценным tile-priming
// (1.7x яркость), теперь мягче и с бо́льшим интервалом).
const TOUR_BLINK_MS = 900
const TOUR_BLINK_GAP_MS = 1100

function TourSelector({ tours }: { tours: typeof CATALOG_TOURS }) {
  const [active, setActive] = useState<number | null>(null)
  // По одной карточке за раз "моргает", в случайном порядке — но ОДИН
  // проход по всем карточкам и остановка (не бесконечный цикл): Виктор
  // после первой версии попросил "один раз, чуть мягче и чуть реже" —
  // слайд без фото должен быть местом, где можно спокойно погрузиться в
  // текст, а не постоянно мельтешащим фоном. Без всплывающих подписей —
  // только яркость картинки (см. .tour-priming) и прозрачность заголовка
  // (см. .tour-caption-blinking) на СУЩЕСТВУЮЩЕМ тексте. Стартует, когда
  // блок реально попал в зону видимости (слайды в SlideDeck смонтированы
  // все сразу — см. аналогичный приём в PhotoStack).
  const [blinking, setBlinking] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms))
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return
        startedRef.current = true
        const order = shuffledIndices(tours.length)
        let step = 0
        const runCycle = () => {
          if (cancelled || step >= order.length) return
          const idx = order[step]
          step += 1
          setBlinking(idx)
          after(() => {
            if (cancelled) return
            setBlinking(null)
            if (step < order.length) after(runCycle, TOUR_BLINK_GAP_MS)
          }, TOUR_BLINK_MS)
        }
        after(runCycle, 500)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => {
      cancelled = true
      observer.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [tours.length])

  return (
    <div
      ref={rootRef}
      className="flex w-full max-w-3xl items-start gap-1 sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl"
    >
      {tours.map((tour, i) => (
        <div key={tour.slug} className={`flex min-w-0 flex-1 flex-col items-center ${STAGGER[i % STAGGER.length]}`}>
          {/* h-36 на мобиле было уменьшено, когда под фотополосой ещё был
              длинный абзац (кнопка обрезалась снизу) — с тех пор текст
              сильно сократили (см. историю задач), а Виктор пожаловался на
              обратное: много пустого места внизу слайда, попросил
              фотографии крупнее. Вернул на уровень sm/lg (h-64). */}
          <Link
            href={`/tours/${tour.slug}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={`relative h-64 w-full overflow-hidden rounded-[1px] bg-muted ring-1 ring-white/10 transition-shadow duration-500 ease-out lg:h-72 ${
              i === active ? "shadow-[0_10px_28px_-6px_rgba(0,0,0,0.55)]" : ""
            }`}
          >
            <div className={`absolute inset-0 ${i === blinking ? "tour-priming" : ""}`}>
              <Image
                src={tour.imageSrc}
                alt={tour.title}
                fill
                sizes="(min-width: 1024px) 700px, (min-width: 640px) 400px, 60vw"
                className="object-cover brightness-100"
              />
            </div>
          </Link>
          <div className="relative mt-1.5 h-3 w-px shrink-0 bg-primary/40">
            <span className="absolute -bottom-px left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary/70" />
          </div>
          <span
            className={`mt-1 text-center font-heading text-[10px] leading-tight font-semibold text-foreground sm:text-xs ${
              i === blinking ? "tour-caption-blinking" : ""
            }`}
          >
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
      {/* px-4 + max-w-full на теле (не px-6/max-w-sm) — тот же приём "текст
          на всю ширину", что уже на IntroSlide (Виктор: "на втором и на
          третьем слайде где текст причеши" — привёл в соответствие). */}
      <div className="flex flex-1 flex-col items-center justify-[safe_center] overflow-y-auto px-4 pt-1 pb-6 text-center sm:px-11 sm:pt-2">
        {/* Фото наверх, заголовок под ними — тот же порядок, что на первом
            и втором слайдах (Виктор: "надо всё-таки заголовок сделать под
            фотографией, фотографии поднять наверх"). */}
        <TourSelector tours={CATALOG_TOURS} />
        <h2 className="mt-6 max-w-xl font-heading text-3xl leading-[1.1] font-semibold sm:mt-8 sm:text-4xl">
          Всего четыре маршрута
        </h2>
        {/* Точная формулировка от Виктора дословно ("вот так скорее похоже
            на то что я хочу написать") — не перефразировать. */}
        <p className="mt-3 max-w-md text-lg leading-snug font-medium text-foreground sm:mt-5 sm:max-w-xl sm:text-xl">
          Авторские маршруты, выверенные до мелочей! Всего 4 программы, потому что они безопасные,
          интересные и при этом глубокие.
        </p>
        <TourCtaButton spacious />
      </div>
    </div>
  )
}

type Quote = { quote: string; author: string }

function reviewToQuote(r: Review): Quote {
  const target = r.tourTitle
    ? `отзыв о туре «${r.tourTitle}»`
    : r.guideName
      ? `отзыв о вожатом (гиде) ${r.guideName}`
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
// Автопереключение — Виктор: "отзывы с достаточно ощутимо большим
// интервалом переключаются рандомно" (не только по свайпу). Целевой индекс —
// случайный из ОСТАЛЬНЫХ (не текущий), не просто "следующий по кругу" —
// иначе выглядело бы как обычная карусель, а не "рандомно". staggerMs
// сдвигает старт первого тика для нижнего слота, чтобы верхняя и нижняя
// карточки не переключались синхронно одним и тем же кадром.
const AUTO_ROTATE_MS = 6000

// siblingIndexRef — индекс СОСЕДНЕГО слота (верхнего для нижнего и наоборот).
// Раньше оба слота выбирали случайный индекс НЕЗАВИСИМО, зная только свой
// текущий индекс — иногда оба совпадали и показывали один и тот же отзыв
// одновременно (Виктор: "2 блока, у них одинаковые отзывы — так не должно
// быть"). pickRandom/pickAdjacent теперь исключают И свой текущий, И
// индекс соседа. ownIndexRef — сюда слот сам пишет свой актуальный индекс
// на каждый рендер, чтобы сосед мог его прочитать как chill siblingIndexRef.
//
// interactedRef — как только человек сам свайпнул или ткнул точку под
// ЭТОЙ карточкой, автопереключение для неё останавливается насовсем
// (Виктор: "устойчивые" — раз человек уже листает вручную, автомат не
// должен вмешиваться). Второй слот (который не трогали) продолжает
// переключаться сам как обычно.
function useQuoteSlot(
  quotes: Quote[],
  startIndex: number,
  opts: { staggerMs?: number; ownIndexRef?: RefObject<number>; siblingIndexRef?: RefObject<number> } = {},
) {
  const { staggerMs = 0, ownIndexRef, siblingIndexRef } = opts
  const [index, setIndex] = useState(startIndex)
  const [direction, setDirection] = useState<1 | -1>(1)
  // setTimeout, а не requestAnimationFrame — см. коммит с фиксом выше: rAF в
  // невидимой/неактивной вкладке может не сработать вообще, карточка тогда
  // застревает прозрачной навсегда.
  const [entering, setEntering] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const interactedRef = useRef(false)

  // Пишем свой актуальный индекс в общий ref — сосед читает его как
  // siblingIndexRef (в эффекте, не в теле рендера — react-hooks/refs).
  useEffect(() => {
    if (ownIndexRef) ownIndexRef.current = index
  }, [index, ownIndexRef])

  useEffect(() => {
    const id = window.setTimeout(() => setEntering(false), 20)
    return () => window.clearTimeout(id)
  }, [index])

  const advance = (dir: 1 | -1) => {
    interactedRef.current = true
    setDirection(dir)
    setEntering(true)
    setIndex((i) => {
      let next = (i + dir + quotes.length) % quotes.length
      const exclude = siblingIndexRef?.current
      // Если следующий по кругу совпал с тем, что уже показывает сосед —
      // проматываем ещё на шаг в ту же сторону (при 2 отзывах в пуле
      // пропускать некуда, тогда оставляем как есть).
      if (exclude !== undefined && quotes.length > 2 && next === exclude) {
        next = (next + dir + quotes.length) % quotes.length
      }
      return next
    })
  }

  useEffect(() => {
    if (quotes.length <= 2) return
    let intervalId: ReturnType<typeof setInterval> | undefined
    const startTimer = window.setTimeout(() => {
      intervalId = setInterval(() => {
        if (interactedRef.current) {
          if (intervalId) clearInterval(intervalId)
          return
        }
        setDirection(1)
        setEntering(true)
        setIndex((i) => {
          let next = Math.floor(Math.random() * quotes.length)
          const exclude = siblingIndexRef?.current
          let guard = 0
          while ((next === i || next === exclude) && guard < 20) {
            next = Math.floor(Math.random() * quotes.length)
            guard += 1
          }
          return next
        })
      }, AUTO_ROTATE_MS)
    }, staggerMs)
    return () => {
      window.clearTimeout(startTimer)
      if (intervalId) clearInterval(intervalId)
    }
  }, [quotes.length, staggerMs, siblingIndexRef])

  const goTo = (i: number) => {
    interactedRef.current = true
    setDirection(i > index ? 1 : -1)
    setEntering(true)
    setIndex(i)
  }

  return {
    quote: quotes[index],
    index,
    direction,
    entering,
    goTo,
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

// Точки под каждой карточкой — видно, что это не единственный отзыв и его
// можно листать (Виктор: "надо видеть, что отзывы можно листать"), а не
// только через сам факт свайпа, который никак не подсказан визуально.
function QuoteSlotView({ slot, count }: { slot: ReturnType<typeof useQuoteSlot>; count: number }) {
  return (
    <div>
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
      {count > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Отзыв ${i + 1}`}
              onClick={() => slot.goTo(i)}
              className={cn("size-1.5 rounded-full transition-colors", i === slot.index ? "bg-primary" : "bg-primary/25")}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function QuotePairs({ quotes }: { quotes: Quote[] }) {
  const safeQuotes = quotes.length > 0 ? quotes : [{ quote: "", author: "" }]
  const topIndexRef = useRef(0)
  const bottomIndexRef = useRef(Math.min(1, safeQuotes.length - 1))
  const top = useQuoteSlot(safeQuotes, 0, { ownIndexRef: topIndexRef, siblingIndexRef: bottomIndexRef })
  const bottom = useQuoteSlot(safeQuotes, Math.min(1, safeQuotes.length - 1), {
    staggerMs: AUTO_ROTATE_MS / 2,
    ownIndexRef: bottomIndexRef,
    siblingIndexRef: topIndexRef,
  })

  if (quotes.length === 0) return null

  return (
    <div className="mt-5 flex w-full max-w-xs flex-col gap-4 sm:hidden">
      <QuoteSlotView slot={top} count={safeQuotes.length} />
      <QuoteSlotView slot={bottom} count={safeQuotes.length} />
    </div>
  )
}

function QuoteSlide({
  title,
  quotes,
}: {
  title: string
  quotes: Quote[]
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative flex flex-1 flex-col items-center justify-[safe_center] overflow-y-auto px-6 pt-3 pb-10 text-center sm:px-11 sm:pt-4 sm:pb-8">
        <h2 className="max-w-2xl font-heading text-2xl leading-[1.15] font-semibold sm:text-3xl">
          {title}
        </h2>

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

        <TourCtaButton hint />
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
      paginationPosition="none"
      slides={[
        <IntroSlide key="intro" />,
        <PhotoSlide
          key="transport"
          title="Трансфер, после которого не нужно восстанавливаться"
          body="Ни тесноты, ни духоты, ни нервотрёпки за рулём. Кожаные кресла с массажем, климат-контроль и просто аккуратный, спокойный водитель."
          imageSrc="/images/hero/premium-van-interior.jpg"
          imageAlt="Салон премиального минивэна с кожаными креслами"
          imagePosition="30% 50%"
          stackImages={[
            "/images/hero/premium-van-exterior.jpg",
            "/images/hero/premium-van-interior-5.jpg",
            "/images/hero/premium-van-interior-6.jpg",
            "/images/hero/premium-van-interior-7.jpg",
            "/images/hero/premium-van-exterior-2.jpg",
            "/images/hero/premium-van-interior-8.jpg",
            "/images/hero/premium-van-exterior-3.jpg",
          ]}
        />,
        <ToursSlide key="tours" />,
        <ValuesSlide
          key="values"
          title="Ваша поездка - под вас, а не под группу"
          points={[
            {
              title: "Только вы - и больше никого",
              body: "Никого не ждём и ни под кого не подстраиваемся.",
            },
            {
              title: "Без туристических ловушек",
              body: "Никаких магазинов с нудными лекциями и завышенными ценами - туда мы просто не заезжаем.",
            },
            {
              title: "Ешьте то, что вам нравится",
              body: "Никакого стандартного пережаренного сета, от которого потом тяжело в животе. Заказываете то, что действительно хотите.",
            },
          ]}
        />,
        <QuoteSlide
          key="guide"
          title="Что говорят гости, которые уже были с нами"
          quotes={heroQuotes.map(reviewToQuote)}
        />,
      ]}
    />
  )
}

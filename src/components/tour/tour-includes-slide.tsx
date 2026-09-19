"use client"

import { useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from "react"
import { CheckCircle2Icon, LuggageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Виктор: "Что входит" и "Что взять с собой" — обратно на один слайд
// (были разнесены на два), но стилизовать по-разному, чтобы не сливались
// в один список. "Что входит" — обычный текстовый список. "Что взять с
// собой" — отдельная карточка с пунктирной рамкой и своими иконками,
// читается как отдельная заметка-чеклист внутри того же экрана.
// "Не входит" убран совсем — на турах с длинным списком утапливал "Что
// взять с собой" вниз.
//
// На мобиле (одна колонка) сумма двух списков (Далат: 6+5 пунктов) не
// помещается на экран целиком. Пробовали вертикальный скролл внутри
// слайда — не сработало: вертикальный Swiper колоды и внутренний скролл
// конкурируют за один и тот же жест, и даже с ручным touch-перехватом
// (см. историю коммитов) Виктор остался недоволен самой идеей скролла
// вниз внутри слайда ("уберите идею с пролистыванием вниз" — то же он
// попросил и про отзывы, см. tour-review-carousel.tsx). Решение то же:
// на мобиле — два свайпаемых вбок панеля (точки-пагинация), каждый
// список по отдельности всегда помещается на экране (это буквально тот
// же контент, что раньше был двумя отдельными слайдами колоды и
// прекрасно помещался). На sm+ места достаточно — там, как и раньше,
// обе колонки видны одновременно side-by-side, без свайпа.
export function TourIncludesSlide({
  includes,
  packingItems,
}: {
  includes: string[]
  packingItems: string[]
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 py-6 sm:px-11">
      <div className="min-h-0 flex-1 sm:hidden">
        <MobilePanels includes={includes} packingItems={packingItems} />
      </div>

      <div className="hidden min-h-0 flex-1 items-center justify-center sm:flex">
        <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-2">
          <IncludesPanel includes={includes} />
          <PackingPanel packingItems={packingItems} />
        </div>
      </div>
    </div>
  )
}

const SWIPE_THRESHOLD_PX = 40

function MobilePanels({ includes, packingItems }: { includes: string[]; packingItems: string[] }) {
  const [index, setIndex] = useState<0 | 1>(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [entering, setEntering] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setEntering(false), 20)
    return () => window.clearTimeout(id)
  }, [index])

  function goTo(i: 0 | 1) {
    setDirection(i > index ? 1 : -1)
    setEntering(true)
    setIndex(i)
  }
  function onTouchStart(e: ReactTouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: ReactTouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    goTo(index === 0 && delta < 0 ? 1 : index === 1 && delta > 0 ? 0 : index)
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="flex min-h-0 flex-1 items-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          key={index}
          className={`w-full transition-all duration-[380ms] ease-out ${
            entering ? (direction === 1 ? "translate-x-4 opacity-0" : "-translate-x-4 opacity-0") : "translate-x-0 opacity-100"
          }`}
        >
          {index === 0 ? <IncludesPanel includes={includes} /> : <PackingPanel packingItems={packingItems} />}
        </div>
      </div>

      <div className="mt-3 flex shrink-0 justify-center gap-1.5">
        {([0, 1] as const).map((i) => (
          <button
            key={i}
            type="button"
            aria-label={i === 0 ? "Что входит" : "Что взять с собой"}
            onClick={() => goTo(i)}
            className={cn("size-1.5 rounded-full transition-colors", i === index ? "bg-primary" : "bg-primary/25")}
          />
        ))}
      </div>
    </div>
  )
}

function IncludesPanel({ includes }: { includes: string[] }) {
  return (
    <div>
      <h2 className="text-center font-heading text-2xl font-semibold sm:text-left sm:text-3xl">Что входит</h2>
      <ul className="mt-6 flex flex-col gap-3 text-sm sm:text-base">
        {includes.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-primary">+</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PackingPanel({ packingItems }: { packingItems: string[] }) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 sm:p-6">
      <h2 className="flex items-center justify-center gap-2 text-center font-heading text-xl font-semibold sm:justify-start sm:text-left sm:text-2xl">
        <LuggageIcon className="size-5 text-primary sm:size-6" />
        Что взять с собой
      </h2>
      <ul className="mt-5 flex flex-col gap-3 text-sm sm:text-base">
        {packingItems.map((item) => (
          <li key={item} className="flex gap-2.5">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

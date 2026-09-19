"use client"

import { useRef } from "react"
import { CheckCircle2Icon, LuggageIcon } from "lucide-react"
import { useShrinkToFit } from "@/hooks/use-shrink-to-fit"

// Виктор: "Что входит" и "Что взять с собой" — один слайд, но стилизовать
// по-разному ("Что входит" — обычный список, "Что взять с собой" —
// карточка с пунктирной рамкой и иконками), чтобы не сливались в одно.
// "Не входит" убран совсем — утапливал "Что взять с собой" вниз.
//
// История поиска варианта для мобилы (одна колонка): вертикальный скролл
// внутри слайда — физически не скроллился на телефоне (вертикальный
// Swiper колоды перехватывал жест), почини́л touch-перехватом — Виктор
// всё равно не хотел скролл как концепцию. Свайп вбок (как в отзывах) —
// "никто не догадается листать вбок". Итог — Виктор явно попросил: всё
// на одном экране, без скролла и без свайпа. Раз контент (Далат: 6+5
// пунктов) не всегда помещается на весь рост при обычном размере текста —
// используем useShrinkToFit: если натуральная высота больше доступной,
// сжимаем ВЕСЬ блок через transform: scale (не трогая сам текст/gap'ы
// по отдельности — тот же принцип "мерить реальную высоту в рантайме",
// что уже применён в DayList/growGap, только в обратную сторону).
export function TourIncludesSlide({
  includes,
  packingItems,
}: {
  includes: string[]
  packingItems: string[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scale = useShrinkToFit(containerRef, contentRef, [includes, packingItems])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 py-6 sm:px-11">
      {/* Мобила — одна колонка, сжимается целиком, чтобы гарантированно
          поместиться без скролла и без свайпа. */}
      <div ref={containerRef} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden sm:hidden">
        <div
          ref={contentRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
          className="flex w-full flex-col gap-8"
        >
          <IncludesPanel includes={includes} />
          <PackingPanel packingItems={packingItems} />
        </div>
      </div>

      {/* sm+ — места всегда хватало на обе колонки рядом, без сжатия. */}
      <div className="hidden min-h-0 flex-1 items-center justify-center sm:flex">
        <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-2">
          <IncludesPanel includes={includes} />
          <PackingPanel packingItems={packingItems} />
        </div>
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

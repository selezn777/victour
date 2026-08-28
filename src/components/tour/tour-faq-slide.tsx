"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { FaqQuestionForm } from "@/components/faq/faq-question-form"
import type { FaqItem } from "@/lib/faq-data"
import type { TourOption } from "@/lib/reviews-data"
import { cn } from "@/lib/utils"

// FAQ как отдельный слайд колоды — вопросы списком, тап раскрывает ответ
// аккордеоном ПРЯМО внутри того же слайда (Виктор: "как бы роллами",
// без перехода на другую страницу/блок). Один открытый вопрос за раз —
// свой стейт (не нативный <details>), чтобы гарантировать это поведение
// и анимировать раскрытие через grid-template-rows (0fr -> 1fr, плавно,
// в отличие от нативного details/summary без transition).
export function TourFaqSlide({
  items,
  tours,
  lockedTourId,
  emptyMessage,
  onGoToReviews,
}: {
  items: FaqItem[]
  tours: TourOption[]
  lockedTourId?: string
  emptyMessage: string
  onGoToReviews: () => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Виктор: "нижние роллы раскрываются некорректно" — вопрос ближе к концу
  // списка раскрывался, но раскрытый ответ уходил под нижнюю плашку с ценой
  // (fixed), а сам скролл-контейнер (overflow-y-auto) сам не подскраливал.
  // Два вызова: сразу (даёт видимость сразу) и повторно после transition
  // (300ms, см. duration-300 у grid-template-rows) — сама раскрывающаяся
  // высота ещё растёт всё это время, целевая позиция уточняется в конце.
  const scrollItemIntoView = (id: string) => {
    const scroll = () => itemRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    scroll()
    setTimeout(scroll, 320)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-24 sm:px-11 sm:pt-9">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          Вопросы и ответы
        </h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Отмена" : "Задать вопрос"}
        </Button>
      </div>

      {showForm && (
        <div className="mt-4">
          <FaqQuestionForm tours={tours} lockedTourId={lockedTourId} />
        </div>
      )}

      {/* swiper-no-swiping — Виктор: открыл последний вопрос, список
          корректно проскроллило вниз (см. scrollItemIntoView выше), но
          вернуться свайпом назад к первому вопросу не смог. Причина — сам
          слайд лежит внутри ВЕРТИКАЛЬНОЙ колоды (SlideDeck): и родительский
          Swiper (смена слайдов), и этот internal overflow-y-auto (скролл
          списка) реагируют на один и тот же вертикальный тач-жест, Swiper
          перехватывал его первым. swiper-no-swiping — штатный класс Swiper
          (noSwipingClass, включён по умолчанию): для тачей, начавшихся
          внутри элемента с этим классом, Swiper вовсе не пытается листать
          слайд, жест целиком достаётся нативному скроллу списка. Клики по
          вопросам (раскрыть/свернуть) не задеты — это только про свайп/драг.
          no-scrollbar — тот же запрос: "линия пролистывания сбоку не нужна". */}
      <div className="swiper-no-swiping no-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto sm:mx-auto sm:w-full sm:max-w-xl">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {items.map((item) => {
              const open = openId === item.id
              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el)
                    else itemRefs.current.delete(item.id)
                  }}
                  className="rounded-xl border border-border bg-card shadow-sm"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => {
                      const next = open ? null : item.id
                      setOpenId(next)
                      if (next) scrollItemIntoView(next)
                    }}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium sm:text-base"
                  >
                    <span>{item.question}</span>
                    <span
                      className={cn(
                        "shrink-0 text-lg text-muted-foreground transition-transform duration-300",
                        open && "rotate-45",
                      )}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-muted-foreground sm:text-base">{item.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Явная подсказка на следующий слайд (отзывы) — без неё гость может
          не понять, что после FAQ есть ещё контент (Виктор один раз уже не
          долистал: "отзывы потерялись"). Отзывы сами стали слайдом колоды
          (см. tour-reviews-slide.tsx), поэтому переход — slideTo, не скролл
          страницы. */}
      <button
        type="button"
        onClick={onGoToReviews}
        className="mt-3 shrink-0 text-center text-sm text-primary hover:underline"
      >
        Отзывы об этом туре →
      </button>
    </div>
  )
}

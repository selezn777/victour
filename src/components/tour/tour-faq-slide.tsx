"use client"

import { useRef, useState, type TouchEvent as ReactTouchEvent } from "react"
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
}: {
  items: FaqItem[]
  tours: TourOption[]
  lockedTourId?: string
  emptyMessage: string
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const scrollRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)

  // Виктор: "не получается подняться назад, отзывы не открываются" —
  // предыдущая версия держалась на swiper-no-swiping + Pointer Events с
  // ручным порогом (dy > 40px) и явными вызовами slidePrev()/slideNext().
  // Проблема глубже, чем сам порог: класс swiper-no-swiping заставляет
  // Swiper решить "не мой жест" ОДИН РАЗ, в момент touchstart — если
  // решение принято, Swiper потом игнорирует touchmove/touchend ВООБЩЕ,
  // весь оставшийся жест целиком, что бы дальше ни происходило. То есть
  // работоспособность слайда держалась ИСКЛЮЧИТЕЛЬНО на собственном
  // Pointer-обработчике — а Pointer Events на мобильных браузерах
  // исторически ненадёжны (не всегда доходит pointerup после скролла,
  // скролл может забрать capture).
  // Новая схема — тот же приём, что уже проверен на "Маршруте"
  // (tour-itinerary-slide.tsx, ранее): БЕЗ swiper-no-swiping, обычные
  // touch-события. Пока внутри списка есть куда скроллить в сторону
  // жеста — глушим touchmove (stopPropagation), Swiper его не видит.
  // На границе — НЕ глушим, событие доходит до Swiper естественным
  // образом, и его собственная (годами обкатанная) логика свайпа сама
  // переключает слайд — никаких ручных slidePrev()/slideNext() и
  // подбора порога больше не нужно.
  function onTouchStart(e: ReactTouchEvent) {
    startYRef.current = e.touches[0].clientY
  }
  function onTouchMove(e: ReactTouchEvent) {
    const el = scrollRef.current
    if (!el) return
    const draggingDown = e.touches[0].clientY - startYRef.current > 0
    const atTop = el.scrollTop <= 0
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    const releaseToSwiper = (atTop && draggingDown) || (atBottom && !draggingDown)
    if (!releaseToSwiper) {
      e.stopPropagation()
    }
  }

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

      {/* no-scrollbar — "линия пролистывания сбоку не нужна". Клики по
          вопросам (раскрыть/свернуть) не задеты touch-обработчиками —
          те реагируют только на движение (touchmove), не на тап. */}
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="no-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto sm:mx-auto sm:w-full sm:max-w-xl"
      >
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
    </div>
  )
}

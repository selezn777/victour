"use client"

import { useRef } from "react"
import type { TourDetail } from "@/lib/site-data"
import { TOUR_ABOUT } from "@/lib/tour-about"
import { useShrinkToFit } from "@/hooks/use-shrink-to-fit"

// Слайд "О туре": заголовок, подзаголовок и серый текст — та же схема, что
// на слайдах главной. Всё на одном экране без скролла (Виктор не хочет
// скролл внутри слайдов): если текст не влезает, блок целиком ужимается
// через useShrinkToFit, как на слайде "Что входит".
export function TourAboutSlide({ tour }: { tour: TourDetail }) {
  const about = TOUR_ABOUT[tour.slug]
  const title = about?.title ?? tour.title
  const lead = about?.lead ?? tour.shortDescription
  const body = about?.body
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useShrinkToFit(containerRef, contentRef, [title, lead, body])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-[calc(1.5rem+var(--tour-bottom-bar-h))] sm:px-11">
      <div ref={containerRef} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div ref={contentRef} className="flex w-full max-w-xl flex-col items-center text-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            О туре
          </span>
          <h2 className="mt-4 font-heading text-3xl leading-[1.1] font-semibold sm:text-4xl">{title}</h2>
          {lead && (
            <p className="mt-3 text-base leading-snug font-medium text-foreground sm:mt-5 sm:text-lg">{lead}</p>
          )}
          {body && (
            <p className="mt-3 text-base leading-snug text-muted-foreground sm:mt-4 sm:text-lg">{body}</p>
          )}
        </div>
      </div>
    </div>
  )
}

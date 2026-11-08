"use client"

import { useRef } from "react"
import type { TourDetail } from "@/lib/site-data"
import { TOUR_ABOUT } from "@/lib/tour-about"
import { useShrinkToFit } from "@/hooks/use-shrink-to-fit"

// Слайд "О туре" (Виктор 2026-11-06): продающее описание - кому, что, зачем.
// Виктор 2026-11-08: без "Читать полностью" и "Скопировать", весь текст на
// одном экране. Тексты в tour-about.ts короткие, а если на низком экране
// всё равно не влезает, useShrinkToFit уменьшает блок целиком (zoom).
export function TourAboutSlide({ tour }: { tour: TourDetail }) {
  const about = TOUR_ABOUT[tour.slug]
  const title = about?.title ?? tour.title
  const lead = about?.lead ?? tour.shortDescription
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useShrinkToFit(containerRef, contentRef, [title, lead, about])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-[calc(1.5rem+var(--tour-bottom-bar-h))] sm:px-11">
      <div ref={containerRef} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div ref={contentRef} className="flex w-full max-w-xl flex-col items-center text-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            О туре
          </span>
          <h2 className="mt-4 font-heading text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl">{title}</h2>
          {lead && (
            <p className="mt-3 text-base leading-snug font-medium text-pretty text-foreground sm:mt-4 sm:text-lg">
              {lead}
            </p>
          )}
          {about && (
            <div className="mt-5 grid w-full gap-2.5 text-left sm:mt-6 sm:grid-cols-2 sm:gap-3">
              {about.blocks.map((b) => (
                <div key={b.h} className="rounded-2xl bg-muted/60 px-3.5 py-2.5">
                  <h3 className="text-[13px] font-semibold tracking-wide text-primary uppercase">{b.h}</h3>
                  <p className="mt-0.5 text-[15px] leading-snug text-pretty text-muted-foreground">{b.p}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

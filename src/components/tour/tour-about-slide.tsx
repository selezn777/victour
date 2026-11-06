"use client"

import { useRef, useState } from "react"
import { CheckIcon, CopyIcon, XIcon } from "lucide-react"
import type { TourDetail } from "@/lib/site-data"
import { TOUR_ABOUT, aboutToText } from "@/lib/tour-about"
import { useShrinkToFit } from "@/hooks/use-shrink-to-fit"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Слайд "О туре" (Виктор 2026-11-06): полноценное продающее описание —
// кому, что, зачем, — которое можно скопировать и отправить в WhatsApp.
// Длинный текст не влезает в слайд, а скролл внутри слайда колоды Виктор
// не хочет (и на телефоне он конфликтует с вертикальным Swiper). Поэтому
// на самом слайде — заголовок, подзаголовок и первый абзац серым, а
// целиком текст открывается в попапе (портал вне колоды, там скролл
// работает) с кнопкой "Скопировать".
export function TourAboutSlide({ tour }: { tour: TourDetail }) {
  const about = TOUR_ABOUT[tour.slug]
  const title = about?.title ?? tour.title
  const lead = about?.lead ?? tour.shortDescription
  const first = about?.blocks[0]?.p
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useShrinkToFit(containerRef, contentRef, [title, lead, first])

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
          {first && (
            <p className="mt-3 text-base leading-snug text-muted-foreground sm:mt-4 sm:text-lg">{first}</p>
          )}
          {about && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-6">
              <Button type="button" size="lg" onClick={() => setOpen(true)}>
                Читать полностью
              </Button>
              <CopyButton text={aboutToText(about)} />
            </div>
          )}
        </div>
      </div>

      {about && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="flex max-h-[88vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg"
            showCloseButton={false}
          >
            <DialogClose
              data-slot="dialog-close"
              render={<Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 z-10" />}
            >
              <XIcon className="size-5" />
              <span className="sr-only">Закрыть</span>
            </DialogClose>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-4 sm:px-7">
              <DialogTitle className="pr-8 font-heading text-2xl leading-[1.15] font-semibold">{about.title}</DialogTitle>
              <p className="mt-3 text-base leading-snug font-medium">{about.lead}</p>
              {about.blocks.map((b, i) => (
                <div key={i} className="mt-4">
                  {b.h && <h3 className="font-heading text-lg font-semibold">{b.h}</h3>}
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{b.p}</p>
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-border p-3">
              <CopyButton text={aboutToText(about)} className="w-full" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          // Старые браузеры/вебвью Instagram без clipboard API.
          const ta = document.createElement("textarea")
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          document.execCommand("copy")
          ta.remove()
        }
        setDone(true)
        setTimeout(() => setDone(false), 2000)
      }}
    >
      {done ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      {done ? "Скопировано" : "Скопировать"}
    </Button>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { MapPinIcon } from "lucide-react"
import { useResort } from "@/hooks/use-resort"
import { RESORTS, resortById } from "@/lib/resorts"

/** Компактный выбор курорта под логотипом в шапке. */
export function ResortSwitcher() {
  const [resort, setResort] = useResort()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  const current = resortById(resort)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
      >
        <MapPinIcon className="size-3 text-primary sm:size-3.5" />
        {current ? current.label : "Выбрать курорт"}
      </button>
      {open && (
        <div className="absolute top-full left-1/2 z-50 mt-2 flex w-44 -translate-x-1/2 flex-col gap-1 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          {RESORTS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setResort(r.id)
                setOpen(false)
              }}
              className={`rounded-lg px-3 py-2.5 text-left font-heading text-base transition-colors hover:bg-muted ${
                r.id === resort ? "bg-muted text-primary" : ""
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Полноэкранный выбор курорта — показываем в каталоге, пока гость не выбрал. */
export function ResortPicker({ className = "" }: { className?: string }) {
  const [, setResort] = useResort()
  return (
    <div className={`flex flex-col items-center justify-center px-4 text-center ${className}`}>
      <h1 className="font-heading text-3xl leading-tight font-semibold sm:text-5xl">Где вы отдыхаете?</h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground sm:text-lg">
        Покажем туры именно с вашего курорта
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {RESORTS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setResort(r.id)}
            className="rounded-full border border-primary/60 px-6 py-4 font-heading text-xl font-semibold transition-colors hover:bg-primary hover:text-primary-foreground active:bg-primary/85"
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}

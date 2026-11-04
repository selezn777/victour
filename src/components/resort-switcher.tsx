"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { MapPinIcon } from "lucide-react"
import { useResort } from "@/hooks/use-resort"
import { RESORTS, resortById, type ResortId } from "@/lib/resorts"

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

const SUGGEST_TEXT: Record<ResortId, string> = {
  nyachang: "Похоже, вы в Нячанге",
  kamran: "Похоже, вы в Камрани",
  phuquoc: "Похоже, вы на Фукуоке",
}

/** Полноэкранный выбор курорта. suggested — курорт по IP (см. /api/geo):
 *  ставим его первым и выделяем. */
export function ResortPicker({
  className = "",
  suggested = null,
}: {
  className?: string
  suggested?: ResortId | null
}) {
  const [, setResort] = useResort()
  const ordered = suggested
    ? [...RESORTS].sort((a, b) => Number(b.id === suggested) - Number(a.id === suggested))
    : RESORTS
  return (
    <div className={`flex flex-col items-center justify-center px-4 text-center ${className}`}>
      <h1 className="font-heading text-3xl leading-tight font-semibold sm:text-5xl">Где вы отдыхаете?</h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground sm:text-lg">
        {suggested ? SUGGEST_TEXT[suggested] : "Покажем туры именно с вашего курорта"}
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {ordered.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setResort(r.id)}
            className={`rounded-full border border-primary/60 px-6 py-4 font-heading text-xl font-semibold transition-colors hover:bg-primary hover:text-primary-foreground active:bg-primary/85 ${
              r.id === suggested ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Курорт можно поменять в любой момент в шапке сайта</p>
    </div>
  )
}

const noopSubscribe = () => () => {}

/** Окно выбора курорта при первом заходе на сайт (пока гость не выбрал).
 *  Рендерим только после монтирования: на сервере выбор неизвестен, и
 *  иначе вернувшиеся гости видели бы мелькание окна. */
export function ResortGate() {
  const [resort] = useResort()
  // true только на клиенте после гидратации (без setState в эффекте)
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const [suggested, setSuggested] = useState<ResortId | null>(null)

  useEffect(() => {
    if (!mounted || resort != null) return
    let cancelled = false
    fetch("/api/geo")
      .then((r) => r.json())
      .then((d: { resort: string | null }) => {
        const r = resortById(d.resort as ResortId)
        if (!cancelled && r) setSuggested(r.id)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [mounted, resort])

  if (!mounted || resort != null) return null
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background">
      <ResortPicker className="min-h-dvh py-10" suggested={suggested} />
    </div>
  )
}

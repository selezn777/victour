"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { MapPinIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useResort } from "@/hooks/use-resort"
import { resortById, type ResortId } from "@/lib/resorts"

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
          {PICKER_ORDER.map((id) => resortById(id)!).map((r) => (
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

/** Полноэкранный выбор курорта. Без подсказки по IP: геолокация мобильных
 *  IP во Вьетнаме врёт, и гостю на Фукуоке подсвечивался Нячанг (Виктор, 13.11).
 *  Фукуок первым - основной курорт. Кнопки не переставляются после загрузки. */
const PICKER_ORDER: ResortId[] = ["phuquoc", "nyachang", "kamran"]

export function ResortPicker({ className = "" }: { className?: string }) {
  const [, setResort] = useResort()
  const ordered = PICKER_ORDER.map((id) => resortById(id)!)
  return (
    <div className={`flex flex-col items-center justify-center px-4 text-center ${className}`}>
      <h1 className="font-heading text-3xl leading-tight font-semibold sm:text-5xl">Где вы отдыхаете?</h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground sm:text-lg">Покажем туры именно с вашего курорта</p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {ordered.map((r) => (
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
      <p className="mt-6 text-sm text-muted-foreground">Курорт можно поменять в любой момент в шапке сайта</p>
    </div>
  )
}

const noopSubscribe = () => () => {}

/** Окно выбора курорта при первом заходе на сайт (пока гость не выбрал).
 *  Рендерим только после монтирования: на сервере выбор неизвестен, и
 *  иначе вернувшиеся гости видели бы мелькание окна. */
// Служебные страницы туриста: по ссылке «моя поездка» не спрашиваем курорт
const NO_GATE = ["/trips", "/account"]

export function ResortGate() {
  const [resort] = useResort()
  const pathname = usePathname()
  // true только на клиенте после гидратации (без setState в эффекте)
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)
  if (!mounted || resort != null || NO_GATE.some((p) => pathname.startsWith(p))) return null
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background">
      <ResortPicker className="min-h-dvh py-10" />
    </div>
  )
}

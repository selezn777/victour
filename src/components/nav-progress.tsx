"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Loader2Icon } from "lucide-react"

// Индикатор перехода между страницами (Виктор 2026-11-13: «нажимаю "Выбрать тур" -
// ничего не происходит, пусть загрузка отображается»). loading.tsx у маршрутов
// показывается только когда его уже успели предзагрузить; на медленном роуминге
// клик мог секундами висеть без отклика. Здесь отклик чисто на клиенте, без сети:
// сразу полоска сверху, через 350 мс ещё и спиннер по центру. Снимается, когда
// сменился адрес (или через 20 с на случай отменённого перехода).
export function NavProgress() {
  const pathname = usePathname()
  const search = useSearchParams()
  const [state, setState] = useState<"idle" | "bar" | "spinner">("idle")
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => {
    clear()
    setState("idle")
  }, [pathname, search])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.("a")
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return
      const href = a.getAttribute("href")
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return
      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      clear()
      setState("bar")
      timers.current.push(setTimeout(() => setState("spinner"), 350))
      timers.current.push(setTimeout(() => setState("idle"), 20000))
    }
    // capture: срабатывает раньше обработчиков, которые могут остановить всплытие
    document.addEventListener("click", onClick, true)
    return () => {
      document.removeEventListener("click", onClick, true)
      clear()
    }
  }, [])

  if (state === "idle") return null
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[300] h-[3px] overflow-hidden">
        <div className="nav-progress-bar h-full bg-primary" />
      </div>
      {state === "spinner" && (
        <div className="pointer-events-none fixed inset-0 z-[299] flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-full bg-card/90 px-4 py-2.5 text-sm text-foreground shadow-lg ring-1 ring-border">
            <Loader2Icon className="size-5 animate-spin text-primary" />
            Загружаем…
          </div>
        </div>
      )}
    </>
  )
}

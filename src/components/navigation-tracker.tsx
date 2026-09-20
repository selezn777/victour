"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { markPageView } from "@/lib/navigation"

// Ставится один раз в корневом layout (переживает все клиентские переходы
// между страницами) — отмечает момент последнего popstate (реальная кнопка
// "назад"/"вперёд" браузера, в отличие от обычного клика по <Link>, который
// делает pushState и popstate НЕ вызывает). См. src/lib/navigation.ts —
// используется, чтобы отличить "вернулся назад" от "зашёл заново по ссылке"
// (Виктор: тур должен восстанавливать слайд только при возврате назад со
// статьи, а не при заходе с главной заново).
export function NavigationTracker() {
  const pathname = usePathname()

  useEffect(() => {
    function onPopState() {
      try {
        sessionStorage.setItem("nav:last-popstate-at", String(Date.now()))
      } catch {
        // sessionStorage может быть недоступен (приватный режим и т.п.) —
        // тогда просто не различаем back/forward, не критично.
      }
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  // Отдельный счётчик просмотров страниц за вкладку — на каждую смену
  // pathname (обычный переход И popstate). Используется ArticleBackLink,
  // чтобы отличить "пришли на статью откуда-то внутри сайта" от "это
  // первая страница в этой вкладке" (прямая ссылка/поиск/шеринг).
  useEffect(() => {
    markPageView()
  }, [pathname])

  return null
}

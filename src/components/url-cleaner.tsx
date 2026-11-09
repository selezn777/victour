"use client"

import { useEffect } from "react"
import { captureFbclid } from "@/lib/meta-click"

// Виктор 2026-11-09: ссылка из Instagram приходит с хвостом
// ?utm_source=ig&...&fbclid=<200 символов>, и при «поделиться» туристы
// пересылают эту простыню. fbclid запоминаем для Conversions API, даём
// аналитике пару секунд прочитать utm и убираем трекинг из адресной строки.
const TRACKING = /^(utm_\w+|fbclid|gclid|igshid|yclid|ttclid|mc_\w+)$/i

export function UrlCleaner() {
  useEffect(() => {
    captureFbclid()
    const url = new URL(window.location.href)
    const keys = [...url.searchParams.keys()].filter((k) => TRACKING.test(k))
    if (keys.length === 0) return
    const timer = setTimeout(() => {
      const now = new URL(window.location.href)
      keys.forEach((k) => now.searchParams.delete(k))
      window.history.replaceState(window.history.state, "", now)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])
  return null
}

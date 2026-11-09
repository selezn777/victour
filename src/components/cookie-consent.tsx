"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "viktour-cookie-consent"

export function CookieConsent({ gaId }: { gaId: string | undefined }) {
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "accepted" || stored === "declined") setConsent(stored)
    setReady(true)
  }, [])

  function choose(value: "accepted" | "declined") {
    localStorage.setItem(STORAGE_KEY, value)
    setConsent(value)
  }

  return (
    <>
      {gaId && consent === "accepted" && <GoogleAnalytics gaId={gaId} />}

      {ready && consent === null && (
        // bottom-20 (не bottom-3) — на странице тура тут же снизу висит
        // сквозная плашка цены/CTA (TourBottomBar, ~64-70px) с тем же
        // расположением на всю ширину на мобиле; баннер с z-50 перекрывал
        // и глушил клики по ней, пока согласие не выбрано (нашёл через
        // Puppeteer против прода: клик по "Подробнее" не срабатывал именно
        // из-за этого перекрытия, без баннера — работал).
        // По центру и компактной квадратной карточкой (Виктор: "по центру, чтобы
        // удобно тыкнуть и идти дальше", "более квадратный"). Крупные кнопки
        // h-11 одна под другой - палец попадает с первого раза.
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex w-[264px] flex-col items-center gap-3 rounded-3xl border border-border bg-card/95 p-5 text-center shadow-2xl backdrop-blur supports-backdrop-filter:bg-card/85">
            <div className="text-3xl leading-none" aria-hidden>🍪</div>
            <p className="text-sm leading-snug text-muted-foreground">
              Cookie только для статистики посещений.{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Подробнее
              </Link>
            </p>
            <div className="flex w-full flex-col gap-2">
              <Button className="h-11 w-full rounded-xl text-base" onClick={() => choose("accepted")}>
                Принять
              </Button>
              <Button variant="ghost" className="h-9 w-full rounded-xl text-muted-foreground" onClick={() => choose("declined")}>
                Отклонить
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

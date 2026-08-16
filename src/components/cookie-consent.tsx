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
        <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:left-auto sm:max-w-xs">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur supports-backdrop-filter:bg-card/85">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Используем cookie для аналитики посещений.{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Подробнее
              </Link>
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => choose("accepted")}>
                Принять
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => choose("declined")}>
                Отклонить
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

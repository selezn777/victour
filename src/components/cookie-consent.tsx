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
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted-foreground">
              Сайт использует cookie для аналитики посещений.{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Подробнее
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => choose("declined")}>
                Отклонить
              </Button>
              <Button size="sm" onClick={() => choose("accepted")}>
                Принять
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

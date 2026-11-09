"use client"

import { useRef } from "react"
import Link from "next/link"
import { CartDrawer } from "@/components/cart-drawer"
import { SiteMenu } from "@/components/site-menu"
import { formatVndFromUsd } from "@/lib/format"
import { useHeaderHeightVar } from "@/hooks/use-header-height-var"
import type { SiteSettings, TourGuide } from "@/lib/site-data"

export function TourHeader({
  settings,
  guide,
}: {
  settings: SiteSettings
  guide: TourGuide | null
}) {
  const headerRef = useRef<HTMLElement>(null)
  useHeaderHeightVar(headerRef)

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <CartDrawer />

        <Link href="/" className="shrink-0 font-heading text-lg font-semibold tracking-tight sm:text-xl">
          ВикТур
        </Link>

        <Link
          href="/tours"
          className="ml-1 text-sm text-muted-foreground hover:text-foreground hover:underline sm:ml-4"
        >
          Все туры
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <span className="hidden text-xs text-muted-foreground md:inline">
            $1 = {formatVndFromUsd(1, settings.usdVndRate)}
          </span>

          {/* Тот же бургер, что на остальном сайте (Виктор 2026-11-09) */}
          <SiteMenu settings={settings} guide={guide} />
        </div>
      </div>
    </header>
  )
}

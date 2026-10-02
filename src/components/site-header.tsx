"use client"

import { useRef } from "react"
import Link from "next/link"
import { CartDrawer } from "@/components/cart-drawer"
import { SiteMenu } from "@/components/site-menu"
import { useHeaderHeightVar } from "@/hooks/use-header-height-var"
import type { PrimaryGuide, SiteSettings } from "@/lib/site-data"

export function SiteHeader({
  settings,
  guide,
}: {
  settings: SiteSettings
  guide: PrimaryGuide | null
}) {
  const headerRef = useRef<HTMLElement>(null)
  useHeaderHeightVar(headerRef)

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-20 sm:px-6">
        <div className="justify-self-start">
          <CartDrawer />
        </div>

        <Link
          href="/"
          className="justify-self-center font-heading text-2xl font-medium sm:text-3xl"
        >
          ВикТур
        </Link>

        <div className="flex items-center justify-self-end">
          <SiteMenu settings={settings} guide={guide} />
        </div>
      </div>
    </header>
  )
}

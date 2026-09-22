"use client"

import { useRef } from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AccountMenuRow } from "@/components/account-menu"
import { CartDrawer } from "@/components/cart-drawer"
import { formatRubFromUsd, formatVndFromUsd } from "@/lib/format"
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
            $1 = {formatVndFromUsd(1, settings.usdVndRate)} · {formatRubFromUsd(1, settings.usdRubRate, settings.rubMarkupPct)}
          </span>

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Меню" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>ВикТур</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <AccountMenuRow />
                <div className="my-2 border-t border-border" />
                <Link href="/tours" className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                  Все туры
                </Link>
                <Link href="/guides" className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                  Гиды
                </Link>
                <span className="px-2 py-2 text-sm text-muted-foreground">
                  $1 = {formatVndFromUsd(1, settings.usdVndRate)}
                </span>
                <span className="px-2 py-2 text-sm text-muted-foreground">
                  $1 = {formatRubFromUsd(1, settings.usdRubRate, settings.rubMarkupPct)}
                </span>
              </nav>
              {guide && (
                <div className="mt-auto border-t border-border p-4">
                  <Link href={`/guides/${guide.id}`} className="text-sm text-primary hover:underline">
                    Гид {guide.name} →
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

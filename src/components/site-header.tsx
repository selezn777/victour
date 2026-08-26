"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AccountMenuRow } from "@/components/account-menu"
import { CartDrawer } from "@/components/cart-drawer"
import { formatRubFromUsd, formatVndFromUsd } from "@/lib/format"
import type { PrimaryGuide, SiteSettings } from "@/lib/site-data"

export function SiteHeader({
  settings,
  guide,
}: {
  settings: SiteSettings
  guide: PrimaryGuide | null
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/60">
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
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Меню" />}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-heading text-lg tracking-[0.02em]">ВикТур</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <AccountMenuRow />
                <div className="my-2 border-t border-border" />
                <Link
                  href="/tours"
                  className="rounded-md px-2 py-2.5 font-heading text-base hover:bg-muted"
                >
                  Туры
                </Link>
                <Link
                  href="/guides"
                  className="rounded-md px-2 py-2.5 font-heading text-base hover:bg-muted"
                >
                  Гиды
                </Link>
                <Link
                  href="/reviews"
                  className="rounded-md px-2 py-2.5 font-heading text-base hover:bg-muted"
                >
                  Отзывы
                </Link>
                <Link
                  href="/faq"
                  className="rounded-md px-2 py-2.5 font-heading text-base hover:bg-muted"
                >
                  Вопросы и ответы
                </Link>
                <Link
                  href="/blog"
                  className="rounded-md px-2 py-2.5 font-heading text-base hover:bg-muted"
                >
                  Полезное
                </Link>
                <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>$1 = {formatVndFromUsd(1, settings.usdVndRate)}</span>
                  <span>
                    $1 = {formatRubFromUsd(1, settings.usdRubRate, settings.rubMarkupPct)}
                  </span>
                  <Link href="/privacy" className="mt-1 hover:underline">
                    Политика конфиденциальности
                  </Link>
                </div>
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

"use client"

import Link from "next/link"
import { HeartIcon, MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { formatRubFromUsd, formatVndFromUsd } from "@/lib/format"
import type { SiteSettings, TourGuide } from "@/lib/site-data"
import { cn } from "@/lib/utils"

export function TourHeader({
  settings,
  guide,
  isFavorite,
  onToggleFavorite,
}: {
  settings: SiteSettings
  guide: TourGuide | null
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link href="/" className="shrink-0 font-heading text-lg font-semibold tracking-tight sm:text-xl">
          ВикТур
        </Link>

        <Link
          href="/#catalog"
          className="ml-1 text-sm text-muted-foreground hover:text-foreground hover:underline sm:ml-4"
        >
          Все туры
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <span className="hidden text-xs text-muted-foreground md:inline">
            $1 = {formatVndFromUsd(1, settings.usdVndRate)} · {formatRubFromUsd(1, settings.usdRubRate, settings.rubMarkupPct)}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
            aria-pressed={isFavorite}
            onClick={onToggleFavorite}
          >
            <HeartIcon className={cn(isFavorite && "fill-current text-destructive")} />
          </Button>

          <ThemeToggle />

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Меню" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>ВикТур</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <Link href="/#catalog" className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                  Все туры
                </Link>
                <span className="px-2 py-2 text-sm text-muted-foreground">
                  $1 = {formatVndFromUsd(1, settings.usdVndRate)}
                </span>
                <span className="px-2 py-2 text-sm text-muted-foreground">
                  $1 = {formatRubFromUsd(1, settings.usdRubRate, settings.rubMarkupPct)}
                </span>
              </nav>
              {guide && (
                <div className="mt-auto flex flex-col gap-1 border-t border-border p-4 text-sm">
                  <span className="text-muted-foreground">Гид {guide.name}</span>
                  {guide.whatsapp && (
                    <a
                      className="hover:underline"
                      href={`https://wa.me/${guide.whatsapp.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  )}
                  {guide.telegram && (
                    <a
                      className="hover:underline"
                      href={`https://t.me/${guide.telegram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Telegram
                    </a>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

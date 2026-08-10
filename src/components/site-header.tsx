"use client"

import Link from "next/link"
import { HeartIcon, MenuIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccountMenu } from "@/components/account-menu"
import { formatRubFromUsd, formatVndFromUsd } from "@/lib/format"
import type { PrimaryGuide, SiteSettings } from "@/lib/site-data"
import { cn } from "@/lib/utils"

export function SiteHeader({
  settings,
  guide,
  searchQuery,
  onSearchChange,
  favoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
}: {
  settings: SiteSettings
  guide: PrimaryGuide | null
  searchQuery: string
  onSearchChange: (value: string) => void
  favoritesOnly: boolean
  onToggleFavoritesOnly: () => void
  favoritesCount: number
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link href="/" className="shrink-0 font-heading text-lg font-semibold tracking-tight sm:text-xl">
          ВикТур
        </Link>

        <div className="relative ml-1 flex-1 sm:ml-4 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Найти тур"
            aria-label="Поиск по турам"
            className="h-8 pl-8 sm:h-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <span className="hidden text-xs text-muted-foreground md:inline">
            $1 = {formatVndFromUsd(1, settings.usdVndRate)} · {formatRubFromUsd(1, settings.usdRubRate, settings.rubMarkupPct)}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Избранные туры"
            aria-pressed={favoritesOnly}
            onClick={onToggleFavoritesOnly}
            className={cn("relative", favoritesOnly && "bg-muted text-foreground")}
          >
            <HeartIcon className={cn(favoritesOnly && "fill-current")} />
            {favoritesCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]"
              >
                {favoritesCount}
              </Badge>
            )}
          </Button>

          <ThemeToggle />

          <AccountMenu />

          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Меню" />}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>ВикТур</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <a href="#catalog" className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                  Туры
                </a>
                <Link href="/reviews" className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                  Отзывы
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

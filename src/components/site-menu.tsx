"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AccountMenuRow } from "@/components/account-menu"
import { formatRubFromUsd, formatVndFromUsd } from "@/lib/format"
import type { PrimaryGuide, SiteSettings } from "@/lib/site-data"

const ITEM = "rounded-md px-2 py-2.5 font-heading text-base hover:bg-muted"

// Бургер-меню сайта — общее для SiteHeader и хедера промо-лендинга /park.
// settings/guide необязательны: /park статический и курсы/гида не грузит.
export function SiteMenu({
  settings,
  guide,
  triggerClassName,
  accent,
}: {
  settings?: SiteSettings
  guide?: PrimaryGuide | null
  triggerClassName?: string
  /** Фон панели в цвет раздела (/park): меню рендерится в портал вне
   *  страницы, поэтому цвет передаём явно и перекрашиваем токены темы. */
  accent?: string
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Меню" className={triggerClassName} />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent
        side="right"
        style={
          accent
            ? ({
                "--popover": accent,
                "--popover-foreground": "#fff",
                "--muted": "rgb(255 255 255 / 0.14)",
                "--muted-foreground": "rgb(255 255 255 / 0.75)",
                "--border": "rgb(255 255 255 / 0.22)",
                "--primary": "#ffe1a8",
              } as React.CSSProperties)
            : undefined
        }
      >
        <SheetHeader>
          <SheetTitle className="font-heading text-lg tracking-[0.02em]">ВикТур</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <AccountMenuRow />
          <div className="my-2 border-t border-border" />
          {/* Главный пункт — туда в первую очередь ведём людей, выделен золотой обводкой; «вдавливается» при нажатии */}
          <Link
            href="/tours"
            className="my-1 flex items-center justify-between rounded-xl bg-[#d9a73e]/10 px-3 py-3 font-heading text-lg font-semibold text-foreground shadow-[0_3px_0_rgb(217_167_62/0.45)] ring-1 ring-[#d9a73e]/50 transition-[transform,box-shadow,background-color] duration-100 active:translate-y-[3px] active:bg-[#d9a73e]/20 active:shadow-none"
          >
            <span>⭐ Туры</span>
            <span aria-hidden className="text-[#e5b955]">→</span>
          </Link>
          {/* Обычные <a>, не Link: /park читает направление из ?t= при загрузке,
              клиентская навигация /park ↔ /park?t=hontam его бы не переключила */}
          <a href="/park" className={ITEM}>
            🚡 Билеты VinWonders
          </a>
          <a href="/park?t=hontam" className={ITEM}>
            🏝 Билеты Хон Там
          </a>
          <Link href="/guides" className={ITEM}>
            Гиды
          </Link>
          <Link href="/reviews" className={ITEM}>
            Отзывы
          </Link>
          <Link href="/blog" className={ITEM}>
            Полезное
          </Link>
          <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
            {settings && (
              <>
                <span>$1 = {formatVndFromUsd(1, settings.usdVndRate)}</span>
                <span>$1 = {formatRubFromUsd(1, settings.usdRubRate, settings.rubMarkupPct)}</span>
              </>
            )}
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
  )
}

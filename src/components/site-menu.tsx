"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AccountMenuRow } from "@/components/account-menu"
import { formatVndFromUsd } from "@/lib/format"
import type { PrimaryGuide, SiteSettings } from "@/lib/site-data"
import { useResort } from "@/hooks/use-resort"

const TICKETS_NT = [
  { href: "/park", label: "🚡 Билеты VinWonders Нячанг" },
  { href: "/park?t=hontam", label: "🏝 Билеты Хон Там" },
]
const TICKETS_PQ = [
  { href: "/phuquoc", label: "🦒 Билеты VinWonders и Сафари Фукуок" },
  { href: "/phuquoc?t=pq_honthom", label: "🚡 Канатка на Хон Тхом" },
]

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
  const [resort] = useResort()
  // Билеты по выбранному курорту; пока не выбран — показываем оба набора
  const tickets =
    resort === "phuquoc"
      ? TICKETS_PQ
      : resort
        ? TICKETS_NT
        : [...TICKETS_NT, ...TICKETS_PQ]
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
          <Link href="/trips" className={ITEM}>
            🧳 Мои поездки
          </Link>
          <div className="my-2 border-t border-border" />
          {/* Главный пункт: крупная залитая кнопка, туда в первую очередь ведём людей */}
          <Link
            href="/tours"
            className="my-2 flex items-center justify-between rounded-2xl bg-[#d9a73e] px-4 py-5 font-heading text-2xl font-bold text-[#2a1d05] shadow-[0_4px_0_#a87b22] transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:shadow-none"
          >
            <span>Наши туры</span>
            <span aria-hidden>→</span>
          </Link>
          {/* Виктор 14.11: фаст-трек - второе главное направление, отдельная кнопка другим цветом */}
          {(resort === "phuquoc" || !resort) && (
            <a
              href="/fasttrack"
              className="mb-2 flex items-center justify-between rounded-2xl bg-[#1f5f9e] px-4 py-4 font-heading text-xl font-bold text-white shadow-[0_4px_0_#123d68] transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:shadow-none"
            >
              <span>
                ✈️ Фаст-трек
                <span className="block text-sm font-medium opacity-85">аэропорт Фукуока без очереди</span>
              </span>
              <span aria-hidden>→</span>
            </a>
          )}
          {/* Групповые выезды пока только на Фукуоке */}
          {(resort === "phuquoc" || !resort) && (
            <Link href="/groups" className={ITEM}>
              👥 Групповые выезды на Фукуоке
            </Link>
          )}
          {/* Обычные <a>, не Link: /park и /phuquoc читают направление из ?t= при загрузке */}
          {tickets.map((t) => (
            <a key={t.href} href={t.href} className={ITEM}>
              {t.label}
            </a>
          ))}
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
              <span>$1 = {formatVndFromUsd(1, settings.usdVndRate)}</span>
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

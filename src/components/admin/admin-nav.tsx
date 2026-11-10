"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HomeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Разделы админки. Виктор 2026-11-10: «переключение вверху сильно не нравится» -
// на телефоне один выпадающий список (системный барабан), на компьютере вкладки
// с квадратными скруглениями как на сайте.
const TABS = [
  { href: "/admin/clients", label: "CRM: лиды и фаст-трек" },
  { href: "/admin/clients?tab=tickets", label: "Билеты в парки" },
  { href: "/admin/bookings", label: "Заявки на туры" },
  { href: "/admin/guides", label: "Гиды" },
  { href: "/admin/blog", label: "Блог" },
  { href: "/admin/tours", label: "Туры" },
]

export function AdminNav() {
  return (
    <Suspense fallback={<div className="h-11" />}>
      <AdminNavInner />
    </Suspense>
  )
}

function AdminNavInner() {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()
  const current = pathname === "/admin/clients" && params.get("tab") === "tickets" ? "/admin/clients?tab=tickets" : pathname
  const active = TABS.find((t) => t.href === current) ?? TABS.find((t) => current.startsWith(`${t.href.split("?")[0]}/`))

  return (
    <nav className="flex items-center gap-2">
      <Link
        href="/"
        aria-label="На сайт"
        className="flex h-11 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <HomeIcon className="size-4" />
        <span className="hidden sm:inline">На сайт</span>
      </Link>
      <select
        value={active?.href ?? ""}
        onChange={(e) => router.push(e.target.value)}
        aria-label="Раздел админки"
        className="h-11 min-w-0 flex-1 cursor-pointer rounded-md border border-border bg-card px-3 text-[15px] font-bold outline-none md:hidden"
      >
        {TABS.map((t) => (
          <option key={t.href} value={t.href}>
            {t.label}
          </option>
        ))}
      </select>
      <div className="hidden flex-wrap gap-1 md:flex">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-md px-3.5 py-2 text-sm font-semibold transition-colors",
              active?.href === t.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/admin/bookings", label: "Заявки" },
  { href: "/admin/guides", label: "Гиды" },
  { href: "/admin/blog", label: "Блог" },
  { href: "/admin/tours", label: "Туры" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="-mx-4 flex items-center gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <Link
        href="/"
        aria-label="На сайт"
        className="mr-1 flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <HomeIcon className="size-4" />
        На сайт
      </Link>
      <div className="h-5 w-px shrink-0 bg-border" />
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
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

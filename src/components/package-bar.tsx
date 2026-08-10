"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePackage } from "@/hooks/use-package"

export function PackageBar() {
  const { items } = usePackage()
  const pathname = usePathname()

  if (items.length === 0 || pathname === "/request") return null

  return (
    <>
      {/* держит место в потоке, чтобы фиксированная панель не перекрывала футер */}
      <div className="h-[60px]" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="text-sm font-medium">
            В заявке: {items.length} {items.length === 1 ? "тур" : "тура"}
          </span>
          <Button size="lg" nativeButton={false} render={<Link href="/request" />}>
            Перейти к заявке
          </Button>
        </div>
      </div>
    </>
  )
}

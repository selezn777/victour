"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { revalidateTours } from "@/app/admin/tours/actions"

export type AdminTourRow = {
  id: string
  title: string
  isActive: boolean
}

export function TourToggleList({ tours }: { tours: AdminTourRow[] }) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  async function toggle(id: string, next: boolean) {
    setPending(id)
    const supabase = createClient()
    await supabase.from("tours").update({ is_active: next }).eq("id", id)
    // Пишем в Supabase напрямую с клиента, но публичные страницы читают
    // тур через кэшируемый серверный getHomepageData() — без явной
    // ревалидации скрытый тур продолжал бы висеть на сайте до деплоя.
    await revalidateTours()
    setPending(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {tours.map((tour) => (
        <div key={tour.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <span
            className={
              "min-w-0 flex-1 truncate " +
              (tour.isActive ? "font-medium" : "font-medium text-muted-foreground line-through")
            }
          >
            {tour.title}
          </span>
          <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            {pending === tour.id ? "…" : tour.isActive ? "Виден на сайте" : "Скрыт"}
            <input
              type="checkbox"
              checked={tour.isActive}
              disabled={pending === tour.id}
              onChange={(e) => toggle(tour.id, e.target.checked)}
              className="size-4 accent-primary"
            />
          </label>
        </div>
      ))}
    </div>
  )
}

import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"
import { AdminNav } from "@/components/admin/admin-nav"
import { TourToggleList, type AdminTourRow } from "@/components/admin/tour-toggle-list"

export const metadata: Metadata = {
  title: "Туры — админка ВикТур",
}

export default async function AdminToursPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("tours")
    .select("id, title, is_active, sort_order")
    .order("sort_order", { ascending: true })

  const tours: AdminTourRow[] = (data ?? []).map((row) => ({
    id: row.id,
    title: (row.title as { ru: string }).ru,
    isActive: row.is_active,
  }))

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Туры</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Скрытый тур пропадает с главной, из каталога и по прямой ссылке — сезонность без правки кода.
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-5">
        <AdminNav />
      </div>

      <div className="mt-6">
        <TourToggleList tours={tours} />
      </div>
    </main>
  )
}

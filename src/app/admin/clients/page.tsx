import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"
import { AdminNav } from "@/components/admin/admin-nav"
import { ClientsBoard, type CrmClient } from "@/components/admin/clients-board"

export const metadata: Metadata = {
  title: "Клиенты — админка ВикТур",
}

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const [{ data, error }, { data: tours }] = await Promise.all([
    supabase.from("crm_clients").select("*").order("created_at", { ascending: false }),
    supabase.from("tours").select("title").order("title"),
  ])

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Клиенты</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Кто написал, кто думает, кто напишет по приезду. Сверху те, кому пора написать.
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-5">
        <AdminNav />
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-destructive/40 p-4 text-sm text-destructive">
          Не удалось загрузить клиентов: {error.message}
        </p>
      ) : (
        <ClientsBoard
          clients={(data as CrmClient[]) ?? []}
          tourTitles={[...new Set((tours ?? []).map((t) => t.title as string))]}
        />
      )}
    </main>
  )
}

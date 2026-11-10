import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"
import { AdminNav } from "@/components/admin/admin-nav"
import { ClientsBoard, type CrmClient } from "@/components/admin/clients-board"
import { ParkBookingsBoard, type ParkRow } from "@/components/admin/park-bookings-board"

export const metadata: Metadata = {
  title: "CRM — админка ВикТур",
}

// CRM: вкладка «Лиды» (Instagram/WhatsApp + фаст-трек с сайта) и «Билеты» (заявки /park, /phuquoc)
export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const tickets = tab === "tickets"
  const supabase = await createClient()
  const [{ data, error }, { data: tours }, park] = await Promise.all([
    supabase.from("crm_clients").select("*").order("created_at", { ascending: false }),
    supabase.from("tours").select("title").order("title"),
    supabase.from("park_bookings").select("*").order("date", { ascending: true }),
  ])
  const titles = (tours ?? []).map((t) => (typeof t.title === "string" ? t.title : (t.title as { ru?: string } | null)?.ru ?? ""))
  const parkRows = (park.data as ParkRow[]) ?? []
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{tickets ? "Билеты в парки" : "CRM"}</h1>
          
        </div>
        <SignOutButton />
      </div>

      <div className="mt-5">
        <AdminNav />
      </div>

      {tickets ? (
        <ParkBookingsBoard rows={parkRows} error={park.error?.message} />
      ) : error ? (
        <p className="mt-6 rounded-xl border border-destructive/40 p-4 text-sm text-destructive">
          Не удалось загрузить клиентов: {error.message}
        </p>
      ) : (
        <ClientsBoard clients={(data as CrmClient[]) ?? []} tourTitles={[...new Set(titles.filter(Boolean))]} />
      )}
    </main>
  )
}

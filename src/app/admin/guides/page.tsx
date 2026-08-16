import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"
import { AdminNav } from "@/components/admin/admin-nav"
import { GuideEditor } from "@/components/admin/guide-editor"
import type { Guide } from "@/lib/guides-data"

export const metadata: Metadata = {
  title: "Гиды — админка ВикТур",
}

type GuideRow = {
  id: string
  name: string
  bio: { ru: string } | null
  photo_url: string | null
  specialties: string[]
  gallery_urls: string[]
  whatsapp: string | null
  telegram: string | null
  instagram: string | null
}

export default async function AdminGuidesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("guides")
    .select("id, name, bio, photo_url, specialties, gallery_urls, whatsapp, telegram, instagram")
    .order("sort_order", { ascending: true })

  const guides: Guide[] = ((data as unknown as GuideRow[]) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    bio: row.bio?.ru ?? null,
    photoUrl: row.photo_url,
    specialties: row.specialties ?? [],
    galleryUrls: row.gallery_urls ?? [],
    whatsapp: row.whatsapp,
    telegram: row.telegram,
    instagram: row.instagram,
  }))

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Профили гидов</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Фото, о себе, специализация — видно всем на странице /guides
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-5">
        <AdminNav />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {guides.map((guide) => (
          <GuideEditor key={guide.id} guide={guide} />
        ))}
      </div>
    </main>
  )
}

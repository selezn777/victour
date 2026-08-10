import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function publicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export type Guide = {
  id: string
  name: string
  bio: string | null
  photoUrl: string | null
  specialties: string[]
  galleryUrls: string[]
  whatsapp: string | null
  telegram: string | null
  instagram: string | null
}

const GUIDE_SELECT =
  "id, name, bio, photo_url, specialties, gallery_urls, whatsapp, telegram, instagram"

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

function mapGuide(row: GuideRow): Guide {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio?.ru ?? null,
    photoUrl: row.photo_url,
    specialties: row.specialties ?? [],
    galleryUrls: row.gallery_urls ?? [],
    whatsapp: row.whatsapp,
    telegram: row.telegram,
    instagram: row.instagram,
  }
}

export async function getGuides(): Promise<Guide[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("guides")
    .select(GUIDE_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return (data as unknown as GuideRow[]).map(mapGuide)
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("guides")
    .select(GUIDE_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle()

  if (error) throw error
  return data ? mapGuide(data as unknown as GuideRow) : null
}

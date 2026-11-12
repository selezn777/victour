// Загрузка файлов в публичный бакет Supabase Storage "media" (с 2026-11-12 вместо Vercel Blob,
// который заблокировали за лимит бесплатного тарифа). Возвращает публичный URL.
import { createClient } from "@supabase/supabase-js"

export const MEDIA_BUCKET = "media"

export async function putMedia(pathname: string, file: File | Blob): Promise<{ url: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("supabase env missing")
  const storage = createClient(url, key, { auth: { persistSession: false } }).storage.from(MEDIA_BUCKET)
  const { error } = await storage.upload(pathname, file, {
    contentType: file.type || undefined,
    cacheControl: "31536000",
    upsert: false,
  })
  if (error) throw new Error(error.message)
  return { url: storage.getPublicUrl(pathname).data.publicUrl }
}

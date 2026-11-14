import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const q = process.argv[2]
const { data } = await db.from("tours").select("slug, title, hero_image_url, gallery_urls").eq("is_active", true)
for (const t of data) {
  const title = typeof t.title === "string" ? t.title : t.title?.ru
  if (!q || title?.toLowerCase().includes(q.toLowerCase())) {
    console.log(t.slug, "|", title, "| hero", t.hero_image_url)
    if (q) (t.gallery_urls ?? []).forEach((u, i) => console.log(i + 1, u))
  }
}

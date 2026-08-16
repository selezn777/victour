"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { destinationLabel } from "@/lib/article-destinations"

export type AdminArticleRow = {
  id: string
  slug: string
  title: string
  destination: string
  isPublished: boolean
}

function slugify(title: string): string {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
    э: "e", ю: "yu", я: "ya",
  }
  return title
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function ArticleList({ articles }: { articles: AdminArticleRow[] }) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  async function createDraft() {
    setCreating(true)
    const supabase = createClient()
    const title = "Новая статья"
    const slug = `${slugify(title)}-${Date.now().toString(36)}`
    const { data, error } = await supabase
      .from("articles")
      .insert({ title, slug, destination: "kam-ranh", body: "" })
      .select("id")
      .single()

    setCreating(false)
    if (error || !data) return
    router.push(`/admin/blog/${data.id}`)
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from("articles").delete().eq("id", id)
    router.refresh()
  }

  return (
    <div>
      <Button type="button" onClick={createDraft} disabled={creating}>
        {creating ? "Создаём…" : "Создать статью"}
      </Button>

      <div className="mt-4 flex flex-col gap-2">
        {articles.length === 0 && <p className="text-sm text-muted-foreground">Статей пока нет.</p>}
        {articles.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <div className="min-w-0">
              <Link href={`/admin/blog/${a.id}`} className="font-medium hover:underline">
                {a.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {destinationLabel(a.destination)} · {a.isPublished ? "опубликовано" : "черновик"}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => remove(a.id)}>
              Удалить
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

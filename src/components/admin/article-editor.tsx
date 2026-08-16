"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { ARTICLE_DESTINATIONS } from "@/lib/article-destinations"
import type { Article } from "@/lib/articles-data"

const inputClass =
  "mt-1.5 w-full rounded-lg border border-input bg-transparent px-3.5 py-2 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"

async function uploadArticlePhoto(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("/api/admin/article-upload", { method: "POST", body: formData })
  const data = (await res.json()) as { ok: boolean; url?: string; error?: string }
  if (!data.ok || !data.url) throw new Error(data.error ?? "upload failed")
  return data.url
}

export function ArticleEditor({
  article,
  tours,
}: {
  article: Article
  tours: { id: string; slug: string; title: string }[]
}) {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState(article.title)
  const [slug, setSlug] = useState(article.slug)
  const [destination, setDestination] = useState(article.destination)
  const [excerpt, setExcerpt] = useState(article.excerpt ?? "")
  const [coverImageUrl, setCoverImageUrl] = useState(article.coverImageUrl)
  const [body, setBody] = useState(article.body)
  const [relatedTourId, setRelatedTourId] = useState(article.relatedTourId ?? "")
  const [isPublished, setIsPublished] = useState(article.isPublished)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(patch: Partial<{
    title: string
    slug: string
    destination: string
    excerpt: string
    coverImageUrl: string | null
    body: string
    relatedTourId: string
    isPublished: boolean
  }>) {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const next = {
      title: patch.title ?? title,
      slug: patch.slug ?? slug,
      destination: patch.destination ?? destination,
      excerpt: patch.excerpt ?? excerpt,
      coverImageUrl: "coverImageUrl" in patch ? patch.coverImageUrl : coverImageUrl,
      body: patch.body ?? body,
      relatedTourId: patch.relatedTourId ?? relatedTourId,
      isPublished: patch.isPublished ?? isPublished,
    }

    const { error: updateError } = await supabase
      .from("articles")
      .update({
        title: next.title.trim(),
        slug: next.slug.trim(),
        destination: next.destination,
        excerpt: next.excerpt.trim() || null,
        cover_image_url: next.coverImageUrl,
        body: next.body,
        related_tour_id: next.relatedTourId || null,
        is_published: next.isPublished,
        published_at: next.isPublished && !article.publishedAt ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)

    if (updateError) setError(updateError.message)
    setSaving(false)
  }

  async function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadArticlePhoto(file)
      setCoverImageUrl(url)
      await save({ coverImageUrl: url })
    } catch {
      setError("Не получилось загрузить фото")
    } finally {
      setUploading(false)
      if (coverInputRef.current) coverInputRef.current.value = ""
    }
  }

  async function onInsertPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadArticlePhoto(file)
      const textarea = bodyRef.current
      const token = `[фото: ${url}]`
      const nextBody = textarea
        ? body.slice(0, textarea.selectionStart) + `\n\n${token}\n\n` + body.slice(textarea.selectionStart)
        : `${body}\n\n${token}\n\n`
      setBody(nextBody)
      await save({ body: nextBody })
    } catch {
      setError("Не получилось загрузить фото")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <label className="text-sm font-medium">Заголовок</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => save({ title })} className="mt-1.5" />
      </div>

      <div>
        <label className="text-sm font-medium">Адрес страницы (slug)</label>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={() => save({ slug })} className="mt-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">/blog/{slug || "..."}</p>
      </div>

      <div>
        <label className="text-sm font-medium">Направление</label>
        <select
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value)
            save({ destination: e.target.value })
          }}
          className={inputClass}
        >
          {Object.entries(ARTICLE_DESTINATIONS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Короткое описание (для карточки и SEO)</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          onBlur={() => save({ excerpt })}
          rows={2}
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Обложка</span>
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => coverInputRef.current?.click()}>
            {uploading ? "Загружаем…" : coverImageUrl ? "Заменить" : "Загрузить"}
          </Button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={onCoverChange} />
        </div>
        {coverImageUrl && (
          <div className="relative mt-2 aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
            <Image src={coverImageUrl} alt="" fill className="object-cover" sizes="480px" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Текст статьи — пустая строка между абзацами. Чтобы вставить фото в текст, поставьте
            курсор куда нужно и нажмите «Вставить фото».
          </label>
        </div>
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => save({ body })}
          rows={16}
          className={`${inputClass} font-mono text-xs`}
        />
        <Button type="button" variant="outline" size="sm" className="mt-2" disabled={uploading} onClick={() => document.getElementById(`insert-photo-${article.id}`)?.click()}>
          {uploading ? "Загружаем…" : "Вставить фото"}
        </Button>
        <input id={`insert-photo-${article.id}`} type="file" accept="image/*" className="hidden" onChange={onInsertPhoto} />
      </div>

      <div>
        <label className="text-sm font-medium">Тур для кнопки "Забронировать" в конце статьи</label>
        <select
          value={relatedTourId}
          onChange={(e) => {
            setRelatedTourId(e.target.value)
            save({ relatedTourId: e.target.value })
          }}
          className={inputClass}
        >
          <option value="">Без привязки — кнопка ведёт на список туров</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => {
            setIsPublished(e.target.checked)
            save({ isPublished: e.target.checked })
          }}
          className="size-4 accent-primary"
        />
        Опубликовано{saving && " · сохраняем…"}
      </label>
    </div>
  )
}

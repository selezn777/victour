"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Guide } from "@/lib/guides-data"

async function uploadGuidePhoto(file: File, guideId: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("guideId", guideId)
  const res = await fetch("/api/admin/guide-upload", { method: "POST", body: formData })
  const data = (await res.json()) as { ok: boolean; url?: string; error?: string }
  if (!data.ok || !data.url) throw new Error(data.error ?? "upload failed")
  return data.url
}

export function GuideEditor({ guide }: { guide: Guide }) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [bio, setBio] = useState(guide.bio ?? "")
  const [specialties, setSpecialties] = useState(guide.specialties.join(", "))
  const [photoUrl, setPhotoUrl] = useState(guide.photoUrl)
  const [galleryUrls, setGalleryUrls] = useState(guide.galleryUrls)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(next: Partial<{ bio: string; specialties: string; photoUrl: string | null; galleryUrls: string[] }>) {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("guides")
      .update({
        bio: { ru: next.bio ?? bio },
        specialties: (next.specialties ?? specialties)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        photo_url: "photoUrl" in next ? next.photoUrl : photoUrl,
        gallery_urls: next.galleryUrls ?? galleryUrls,
      })
      .eq("id", guide.id)

    if (updateError) setError(updateError.message)
    setSaving(false)
  }

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadGuidePhoto(file, guide.id)
      setPhotoUrl(url)
      await save({ photoUrl: url })
    } catch {
      setError("Не получилось загрузить фото")
    } finally {
      setUploading(false)
      if (photoInputRef.current) photoInputRef.current.value = ""
    }
  }

  async function onGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const urls = await Promise.all(files.map((f) => uploadGuidePhoto(f, guide.id)))
      const next = [...galleryUrls, ...urls]
      setGalleryUrls(next)
      await save({ galleryUrls: next })
    } catch {
      setError("Не получилось загрузить фото")
    } finally {
      setUploading(false)
      if (galleryInputRef.current) galleryInputRef.current.value = ""
    }
  }

  async function removeGalleryPhoto(url: string) {
    const next = galleryUrls.filter((u) => u !== url)
    setGalleryUrls(next)
    await save({ galleryUrls: next })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted">
          {photoUrl && <Image src={photoUrl} alt={guide.name} fill className="object-cover" sizes="80px" />}
        </div>
        <div>
          <div className="font-heading text-lg font-semibold">{guide.name}</div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1.5"
            disabled={uploading}
            onClick={() => photoInputRef.current?.click()}
          >
            {uploading ? "Загружаем…" : "Изменить фото профиля"}
          </Button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor={`bio-${guide.id}`}>О себе</label>
        <textarea
          id={`bio-${guide.id}`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          onBlur={() => save({ bio })}
          rows={4}
          placeholder="Расскажите гостям о себе — опыт, что любите показывать, чем гордитесь"
          className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-3.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor={`specialties-${guide.id}`}>
          Специализация (через запятую)
        </label>
        <Input
          id={`specialties-${guide.id}`}
          value={specialties}
          onChange={(e) => setSpecialties(e.target.value)}
          onBlur={() => save({ specialties })}
          className="mt-1.5"
          placeholder="Горные маршруты, Острова, Гастротуры"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Галерея фото с туров</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => galleryInputRef.current?.click()}
          >
            {uploading ? "Загружаем…" : "Добавить фото"}
          </Button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onGalleryChange}
          />
        </div>
        {galleryUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {galleryUrls.map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                <button
                  type="button"
                  aria-label="Убрать фото"
                  onClick={() => removeGalleryPhoto(url)}
                  className="absolute top-1 right-1 rounded-full bg-black/70 p-1.5 text-white"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saving && <p className="text-xs text-muted-foreground">Сохраняем…</p>}
    </div>
  )
}

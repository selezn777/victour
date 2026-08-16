import Image from "next/image"

// Простой формат тела статьи — без markdown-библиотеки: абзацы разделены пустой
// строкой, фото-вставка — отдельная строка вида [фото: URL] или [фото: URL | подпись].
const PHOTO_LINE = /^\[фото:\s*(\S+?)(?:\s*\|\s*(.+))?\]$/

export function ArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        const photoMatch = block.match(PHOTO_LINE)
        if (photoMatch) {
          const [, url, caption] = photoMatch
          return (
            <figure key={i}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                <Image src={url} alt={caption ?? ""} fill className="object-cover" sizes="(min-width: 768px) 720px, 100vw" />
              </div>
              {caption && (
                <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">{caption}</figcaption>
              )}
            </figure>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:text-base">
            {block}
          </p>
        )
      })}
    </div>
  )
}

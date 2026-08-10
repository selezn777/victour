import Image from "next/image"
import Link from "next/link"
import type { Guide } from "@/lib/guides-data"

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group relative aspect-3/4 block overflow-hidden rounded-2xl bg-muted"
    >
      {guide.photoUrl && (
        <Image
          src={guide.photoUrl}
          alt={guide.name}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-white">
        <span className="text-xs tracking-wide text-white/70 uppercase">Гид</span>
        <h3 className="font-heading text-2xl leading-tight font-semibold">{guide.name}</h3>
        {guide.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {guide.specialties.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full border border-white/30 px-2.5 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

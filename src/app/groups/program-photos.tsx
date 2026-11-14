"use client"

import { useRef, useState } from "react"
import Image from "@/components/img"

// Фото программы по одному: одинаковая рамка 4:3, листание свайпом или стрелками,
// точки и счётчик. Состояние в React, без CSS scroll-snap (на мобиле он ломался).
export function ProgramPhotos({ photos, title }: { photos: string[]; title: string }) {
  const [i, setI] = useState(0)
  const start = useRef<{ x: number; y: number } | null>(null)
  const n = photos.length
  const go = (d: number) => setI((p) => (p + d + n) % n)

  return (
    <div
      className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden bg-(--c-bg-2) select-none"
      onTouchStart={(e) => (start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const s = start.current
        start.current = null
        if (!s) return
        const dx = e.changedTouches[0].clientX - s.x
        const dy = e.changedTouches[0].clientY - s.y
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
      }}
    >
      {photos.map((src, k) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-300 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={k !== i}
        >
          {/* соседние кадры грузим заранее, остальные лениво */}
          <Image
            src={src}
            alt={k === 0 ? title : `${title}, фото ${k + 1}`}
            fill
            loading={Math.abs(k - i) <= 1 || (i === 0 && k === n - 1) ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover"
          />
        </div>
      ))}
      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Предыдущее фото"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-[20px] text-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Следующее фото"
            onClick={() => go(1)}
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-[20px] text-white"
          >
            ›
          </button>
          <span className="absolute top-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[11.5px] font-bold text-white tabular-nums">
            {i + 1}/{n}
          </span>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {photos.map((src, k) => (
              <span key={src} className={`size-1.5 rounded-full ${k === i ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

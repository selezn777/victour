"use client"

import Image from "next/image"
import { usePinchZoom } from "@/hooks/use-pinch-zoom"

// Обёртка над next/image с зумом щипком двух пальцев (отпустил — зум
// плавно сбрасывается). Каждый экземпляр — свой хук/своё состояние, так
// что у каждого фото в карусели зум независимый (актуально только для
// того, что реально на экране, остальные слайды всё равно вне видимости).
export function PinchZoomPhoto({
  src,
  alt,
  priority,
}: {
  src: string
  alt: string
  priority?: boolean
}) {
  const pinch = usePinchZoom()

  return (
    <div className="relative h-full w-full overflow-hidden" {...pinch.handlers} style={pinch.style}>
      <Image src={src} alt={alt} fill priority={priority} className="object-cover" sizes="100vw" />
    </div>
  )
}

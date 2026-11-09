"use client"

// Обёртка над next/image (2026-11-08): фото, для которых scripts/image-variants.mjs уже
// положил готовые копии в Blob, грузятся прямо оттуда (sin1, ~0.2 с), минуя
// victour.vercel.app (из Вьетнама идёт через hkg1, 0.3-1.5 с на каждый файл) и пережатие
// /_next/image. Остальные (новые загрузки, статические импорты) идут как раньше.
import NextImage, { type ImageLoader, type ImageProps } from "next/image"
import { forwardRef } from "react"
import { variantUrl } from "@/lib/image-variant-url"

const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(props, ref) {
  const { src } = props
  if (typeof src !== "string" || props.unoptimized || props.loader || !variantUrl(src, 640)) {
    return <NextImage ref={ref} {...props} />
  }
  const loader: ImageLoader = ({ src: s, width }) => variantUrl(s, width) ?? s
  return <NextImage ref={ref} {...props} loader={loader} />
})

export default Image

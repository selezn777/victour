// Готовые копии фото в Supabase Storage (бакет media, папка opt/), см. scripts/image-variants.mjs и components/img.tsx.
import manifest from "./image-variants.json"

const KEYS: Record<string, string> = manifest.keys
const WIDTHS = [...manifest.widths].sort((a, b) => a - b)
// Оригиналы лежат в корне бакета, копии - в opt/ того же бакета (manifest.base)
const MEDIA_ROOT = manifest.base ? manifest.base.replace(/opt\/$/, "") : ""

function keyOf(src: string): string | null {
  const clean = src.split(/[?#]/)[0]
  try {
    if (clean.startsWith("/")) return "public" + decodeURI(clean)
    if (MEDIA_ROOT && clean.startsWith(MEDIA_ROOT)) return decodeURI(clean.slice(MEDIA_ROOT.length))
  } catch {}
  return null
}

/** URL готовой копии ширины не меньше `width` (или самой большой), либо null, если копий нет. */
export function variantUrl(src: string, width: number): string | null {
  if (!MEDIA_ROOT) return null
  const key = keyOf(src)
  const ver = key ? KEYS[key] : undefined
  if (!key || !ver) return null
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1]
  return `${manifest.base}${encodeURI(key.replace(/\.[^./]+$/, ""))}.${ver}-w${w}.webp`
}

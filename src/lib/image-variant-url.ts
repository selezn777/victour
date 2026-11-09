// Готовые копии фото в Blob, см. scripts/image-variants.mjs и components/img.tsx.
import manifest from "./image-variants.json"

const KEYS: Record<string, string> = manifest.keys
const WIDTHS = [...manifest.widths].sort((a, b) => a - b)
const BLOB_ORIGIN = manifest.base ? new URL(manifest.base).origin : ""

function keyOf(src: string): string | null {
  const clean = src.split(/[?#]/)[0]
  try {
    if (clean.startsWith("/")) return "public" + decodeURI(clean)
    if (BLOB_ORIGIN && clean.startsWith(BLOB_ORIGIN + "/")) return decodeURI(clean.slice(BLOB_ORIGIN.length + 1))
  } catch {}
  return null
}

/** URL готовой копии ширины не меньше `width` (или самой большой), либо null, если копий нет. */
export function variantUrl(src: string, width: number): string | null {
  if (!BLOB_ORIGIN) return null
  const key = keyOf(src)
  const ver = key ? KEYS[key] : undefined
  if (!key || !ver) return null
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1]
  return `${manifest.base}${encodeURI(key.replace(/\.[^./]+$/, ""))}.${ver}-w${w}.webp`
}

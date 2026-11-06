// Склейка первых 64 фото коллажа (8×8, в порядке плиток) в одну картинку:
// главная показывает её фоном, отдельные плитки больше не грузятся.
// Запускать после любой замены фото в public/images/collage:
//   node scripts/build-collage-composite.mjs <версия = COMPOSITE_VERSION> [размер плитки, 112]
import sharp from "sharp"
const v = process.argv[2] ?? "4"
const T = Number(process.argv[3] ?? 112)
const tiles = await Promise.all(
  Array.from({ length: 64 }, (_, i) =>
    sharp(`public/images/collage/collage-${String(i + 1).padStart(2, "0")}.jpg`)
      .rotate()
      .resize(T, T, { fit: "cover" })
      .toBuffer(),
  ),
)
const big = sharp({ create: { width: T * 8, height: T * 8, channels: 3, background: "#111" } }).composite(
  tiles.map((input, i) => ({ input, left: (i % 8) * T, top: Math.floor(i / 8) * T })),
)
const buf = await big.png().toBuffer()
const out = `public/images/collage/composite-v${v}.webp`
const info = await sharp(buf).webp({ quality: 62 }).toFile(out)
const tiny = await sharp(buf).resize(48, 48).webp({ quality: 40 }).toBuffer()
console.log(out, info.size, "B")
console.log("tiny data URI:", "data:image/webp;base64," + tiny.toString("base64"))

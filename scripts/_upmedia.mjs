// node --env-file=.env.local scripts/_upmedia.mjs <keyPrefix> <files...>: грузит фото в media/<keyPrefix>-NN.webp + opt-варианты, печатает URL
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"; import fs from "fs"; import crypto from "crypto"
sharp.concurrency(1)
const [prefix, ...files] = process.argv.slice(2)
const U = process.env.NEXT_PUBLIC_SUPABASE_URL
const db = createClient(U, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const st = db.storage.from("media"), BASE = `${U}/storage/v1/object/public/media/`
const man = JSON.parse(fs.readFileSync("src/lib/image-variants.json", "utf8"))
const o = { contentType: "image/webp", upsert: false, cacheControl: "31536000" }
const up = async (p, b) => { for (let i = 0; i < 5; i++) { const { error } = await st.upload(p, b, o); if (!error) return; if (i == 4) throw error; await new Promise(r => setTimeout(r, 2000)) } }
for (const [i, f] of files.entries()) {
  const key = `${prefix}-${String(i + 1).padStart(2, "0")}.webp`
  const buf = await sharp(f).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer()
  await up(key, buf)
  const ver = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8)
  for (const w of man.widths) await up(`opt/${key.replace(/\.webp$/, "")}.${ver}-w${w}.webp`, await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer())
  man.keys[key] = ver; console.log(BASE + key)
}
man.keys = Object.fromEntries(Object.entries(man.keys).sort())
fs.writeFileSync("src/lib/image-variants.json", JSON.stringify(man) + "\n")

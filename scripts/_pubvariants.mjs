// node --env-file=.env.local scripts/_pubvariants.mjs <public files...>: opt-варианты для файлов из public/ в Supabase media/opt + ключи в манифест
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"; import fs from "fs"; import crypto from "crypto"
sharp.concurrency(1)
const U = process.env.NEXT_PUBLIC_SUPABASE_URL
const st = createClient(U, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).storage.from("media")
const man = JSON.parse(fs.readFileSync("src/lib/image-variants.json", "utf8"))
const o = { contentType: "image/webp", upsert: true, cacheControl: "31536000" }
const up = async (p, b) => { for (let i = 0; i < 5; i++) { const { error } = await st.upload(p, b, o); if (!error) return; if (i == 4) throw error; await new Promise(r => setTimeout(r, 2000)) } }
for (const f of process.argv.slice(2)) {
  const buf = fs.readFileSync(f)
  const key = "public/" + f.replace(/^public\//, "")
  const ver = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8)
  for (const w of man.widths)
    await up(`opt/${key.replace(/\.[^./]+$/, "")}.${ver}-w${w}.webp`, await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer())
  man.keys[key] = ver; console.log(key, ver)
}
man.keys = Object.fromEntries(Object.entries(man.keys).sort())
fs.writeFileSync("src/lib/image-variants.json", JSON.stringify(man) + "\n")

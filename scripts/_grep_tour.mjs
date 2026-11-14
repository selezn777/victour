// node --env-file=.env.local scripts/_grep_tour.mjs <slug> <regex>  - где в строке тура встречается текст
import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const [slug, re] = process.argv.slice(2)
const { data: t } = await db.from("tours").select("*").eq("slug", slug).single()
const rx = new RegExp(re, "i")
function walk(v, path) {
  if (typeof v === "string") { if (rx.test(v)) console.log(path, "=>", v) }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
  else if (v && typeof v === "object") for (const k of Object.keys(v)) walk(v[k], `${path}.${k}`)
}
walk(t, slug)

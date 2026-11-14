import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
for (const t of ["group_departures", "group_signups"]) {
  const r = await db.from(t).select("*", { count: "exact", head: true })
  console.log(t, r.error ? `ERR ${r.error.code} ${r.error.message}` : `ok count=${r.count}`)
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ADMIN_EMAIL = "selezn.777@gmail.com"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const fallback = data.user?.email === ADMIN_EMAIL ? "/admin/bookings" : "/account"
      return NextResponse.redirect(`${origin}${next ?? fallback}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}

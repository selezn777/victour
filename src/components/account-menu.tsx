"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const ADMIN_EMAIL = "selezn.777@gmail.com"

export function AccountMenu() {
  const [email, setEmail] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  if (email === undefined) {
    return <Button variant="ghost" size="icon-sm" aria-hidden className="opacity-0" />
  }

  if (!email) {
    return (
      <Button variant="ghost" size="icon-sm" aria-label="Войти" render={<Link href="/login" />}>
        <UserIcon />
      </Button>
    )
  }

  const href = email === ADMIN_EMAIL ? "/admin/bookings" : "/account"
  const initial = email.charAt(0).toUpperCase()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Личный кабинет"
      render={<Link href={href} />}
      className="rounded-full bg-muted font-medium"
    >
      {initial}
    </Button>
  )
}

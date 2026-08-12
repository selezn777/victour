"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const ADMIN_EMAIL = "selezn.777@gmail.com"

function useAccountEmail() {
  const [email, setEmail] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  return email
}

export function AccountMenu() {
  const email = useAccountEmail()

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

export function AccountMenuRow() {
  const email = useAccountEmail()

  if (!email) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2.5 rounded-md px-2 py-2.5 font-heading text-base hover:bg-muted"
      >
        <UserIcon className="size-4" />
        Войти
      </Link>
    )
  }

  const href = email === ADMIN_EMAIL ? "/admin/bookings" : "/account"

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md px-2 py-2.5 font-heading text-base hover:bg-muted"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {email.charAt(0).toUpperCase()}
      </span>
      Личный кабинет
    </Link>
  )
}

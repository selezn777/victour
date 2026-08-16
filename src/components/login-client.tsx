"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="size-4">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 5.9 4.3C13.9 15.2 18.6 12 24 12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.6 6.1 29 4 24 4c-7.4 0-13.8 4.2-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5 0 9.5-1.9 12.9-5l-6-5c-1.9 1.3-4.3 2-6.9 2-5.3 0-9.7-3.4-11.3-8.1l-6 4.6C10.1 39.7 16.5 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6 5C40.9 34.9 44 30 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}

export function LoginClient({ next }: { next: string | null }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const callbackUrl = new URL("/auth/callback", window.location.origin)
    if (next) callbackUrl.searchParams.set("next", next)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    })
    if (error) {
      setError("Не получилось начать вход через Google. Попробуйте ещё раз.")
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
      <Link href="/" className="font-heading text-2xl font-semibold tracking-tight">
        ВикТур
      </Link>
      <p className="text-sm text-muted-foreground">
        Войдите, чтобы видеть свои заявки, даты и рекомендации по турам.
      </p>

      <Button
        variant="outline"
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full gap-2.5 bg-white text-neutral-900 hover:bg-neutral-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
      >
        <GoogleLogo />
        Войти через Google
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Продолжая, вы соглашаетесь с{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          политикой конфиденциальности
        </Link>
      </p>
    </main>
  )
}

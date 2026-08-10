import type { Metadata } from "next"
import { LoginClient } from "@/components/login-client"

export const metadata: Metadata = {
  title: "Вход — ВикТур",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return <LoginClient next={next ?? null} />
}

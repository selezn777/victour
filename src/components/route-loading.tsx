import Link from "next/link"
import { Loader2Icon } from "lucide-react"

// Next показывает это МГНОВЕННО в момент клика по Link на маршрут, у которого
// есть свой async-сервер-компонент (см. loading.tsx рядом со страницей) — пока
// он ждёт данные (Supabase-запросы), гость видит не пустой экран, а то, что
// переход уже пошёл. Шапка здесь статична (без данных settings/guide, которые
// требуют своего запроса) — специально не связана с SiteHeader, чтобы сам
// fallback не заставлял ждать ещё один запрос.
export function RouteLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col">
      <header className="flex h-16 items-center justify-center border-b border-border/60 sm:h-20">
        <Link href="/" className="font-heading text-2xl font-medium sm:text-3xl">
          ВикТур
        </Link>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2Icon className="size-8 animate-spin text-primary" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}

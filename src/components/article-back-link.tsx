"use client"

import { useRouter } from "next/navigation"
import { hasInternalHistory } from "@/lib/navigation"

// Виктор: раньше тут была статичная ссылка на /blog ("Все статьи") — она
// всегда уводила в список статей, даже если человек пришёл читать статью
// из описания тура (маршрут) или из поиска. Из-за этого терялся контекст
// и, по его словам, "мы теряем туриста". window.history.length для этого
// не годится (у свежей вкладки он часто уже 2 без единого внутреннего
// перехода) — используем свой счётчик просмотров страниц за вкладку
// (см. hasInternalHistory в src/lib/navigation.ts): если до статьи была
// хотя бы одна другая страница сайта — возвращаемся на неё (список статей,
// тур с восстановлением слайда маршрута — см. tour-page-client.tsx, — или
// страница с внутренним поиском). Если статья — первая страница в этой
// вкладке (прямая ссылка, шеринг, поиск в Google) — идём на главную.
export function ArticleBackLink() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        if (hasInternalHistory()) {
          router.back()
        } else {
          router.push("/")
        }
      }}
      className="text-sm text-muted-foreground hover:underline"
    >
      ← Назад
    </button>
  )
}

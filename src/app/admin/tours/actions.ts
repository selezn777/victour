"use server"

import { revalidatePath } from "next/cache"

// Тумблер "Виден на сайте" пишет в Supabase напрямую из клиента
// (tour-toggle-list.tsx) — это ок для самой записи, но публичные страницы
// (/, /tours, /account, /reviews) получают данные тура через getHomepageData()
// в серверных компонентах, которые Next кэширует; без ревалидации кэш не
// узнаёт, что строка в БД изменилась, и скрытый тур продолжает
// показываться до следующего деплоя. Виктор: "нажал скрыть, а они всё
// равно остались".
export async function revalidateTours() {
  revalidatePath("/")
  revalidatePath("/tours")
  revalidatePath("/account")
  revalidatePath("/reviews")
}

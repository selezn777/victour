// Окно, в течение которого монтирование страницы после popstate считается
// "тем самым" возвратом назад, а не совпадением. Next.js может подгружать
// RSC-пейлоад для страницы, на которую вернулись, так что между самим
// popstate и реальным монтированием компонента возможна заметная задержка
// на медленной сети — 2 секунды с запасом покрывают это, но при этом
// исключают случай "нажал назад где-то в другом месте сайта, а через
// несколько секунд кликнул по ссылке на тур" (ложное срабатывание там
// потребовало бы кликнуть за 2 секунды после несвязанного "назад").
const BACK_NAV_WINDOW_MS = 2000

/** true, если самая последняя навигация — это popstate (кнопка "назад"/
 * "вперёд" браузера), а не обычный переход по ссылке. См. NavigationTracker. */
export function isRecentBackNavigation(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = sessionStorage.getItem("nav:last-popstate-at")
    if (!raw) return false
    return Date.now() - Number(raw) < BACK_NAV_WINDOW_MS
  } catch {
    return false
  }
}

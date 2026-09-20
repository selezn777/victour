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

/** Вызывается из NavigationTracker при каждой смене pathname (и обычные
 * переходы, и popstate) — считает просмотры страниц САЙТА за эту вкладку.
 * Нужно, чтобы отличить "пришёл на статью откуда-то внутри сайта" от
 * "это первая страница в этой вкладке" (прямая ссылка/шеринг/поиск в
 * Google) — window.history.length для этого не годится: у свежей вкладки
 * он часто уже равен 2 (пустая "новая вкладка" + текущая страница), даже
 * если внутри сайта переходов не было. См. ArticleBackLink. */
export function markPageView(): void {
  if (typeof window === "undefined") return
  try {
    const count = Number(sessionStorage.getItem("nav:page-views") ?? "0")
    sessionStorage.setItem("nav:page-views", String(count + 1))
  } catch {
    // sessionStorage может быть недоступен — тогда просто не различаем.
  }
}

/** true, если до текущей страницы в этой вкладке уже была хотя бы одна
 * другая страница сайта — значит, у "назад" есть куда возвращаться. */
export function hasInternalHistory(): boolean {
  if (typeof window === "undefined") return false
  try {
    return Number(sessionStorage.getItem("nav:page-views") ?? "0") > 1
  } catch {
    return false
  }
}

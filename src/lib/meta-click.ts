// ID клика Meta (fbc) для Conversions API. Пиксель на сайте не стоит, поэтому
// fbclid из рекламной ссылки запоминаем сами: при переходах по /park параметр
// теряется, а заявку оставляют позже.

const KEY = "victour_fbc"
const TTL_MS = 90 * 24 * 60 * 60 * 1000

export function captureFbclid(): void {
  try {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid")
    if (fbclid) localStorage.setItem(KEY, `fb.1.${Date.now()}.${fbclid}`)
  } catch {}
}

export function readFbc(): string | null {
  try {
    const cookie = document.cookie.match(/(?:^|;\s*)_fbc=([^;]+)/)?.[1]
    if (cookie) return decodeURIComponent(cookie)
    const stored = localStorage.getItem(KEY)
    if (stored && Date.now() - Number(stored.split(".")[2]) < TTL_MS) return stored
  } catch {}
  return null
}

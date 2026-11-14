// Черновик фаст-трека переживает обновление страницы, случайное «назад» и выгрузку вкладки
// (Android часто перезагружает страницу, пока человек выбирает фото паспорта в галерее).
// Поля и шаг - в localStorage, файлы паспортов/ваучеров - в IndexedDB. Через 7 дней черновик забываем.

const KEY = "ft-draft-v4"
const TTL_MS = 7 * 24 * 3600 * 1000
const DB = "ft-docs"
const STORE = "docs"

export type SavedDoc = { id: string; kind: "passport" | "voucher"; file: File; owner?: number }

export function loadDraft<T>(): { d: T; step: number } | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const v = JSON.parse(raw) as { d: T; step: number; at: number }
      if (v && v.d && Date.now() - v.at < TTL_MS) return { d: v.d, step: v.step || 1 }
      localStorage.removeItem(KEY)
    }
    // старый формат (sessionStorage), чтобы не потерять уже начатое
    const old = sessionStorage.getItem("ft-draft-v2")
    if (old) return { d: JSON.parse(old) as T, step: 1 }
  } catch {}
  return null
}

export function saveDraft<T>(d: T, step: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ d, step, at: Date.now() }))
  } catch {}
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem("ft-draft-v2")
  } catch {}
  void withStore("readwrite", (s) => s.clear())
}

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" })
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function withStore<R>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<R>): Promise<R | null> {
  const db = await open()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

type Row = { id: string; kind: "passport" | "voucher"; blob: Blob; name: string; type: string; at: number; owner?: number }

export function saveDoc(doc: SavedDoc) {
  const row: Row = { id: doc.id, kind: doc.kind, blob: doc.file, name: doc.file.name, type: doc.file.type, at: Date.now(), owner: doc.owner }
  void withStore("readwrite", (s) => s.put(row))
}

export function deleteDoc(id: string) {
  void withStore("readwrite", (s) => s.delete(id))
}

export async function loadDocs(): Promise<SavedDoc[]> {
  const rows = ((await withStore("readonly", (s) => s.getAll())) ?? []) as Row[]
  return rows
    .filter((r) => r && r.blob && Date.now() - (r.at || 0) < TTL_MS)
    .sort((a, b) => a.at - b.at)
    .map((r) => ({ id: r.id, kind: r.kind, owner: r.owner, file: new File([r.blob], r.name, { type: r.type }) }))
}

import { adminBotApi, adminChatId, isAdminBotConfigured } from "@/lib/admin-bot"

// Дополнение к admin-bot.ts (фаст-трек, 2026-11-14): сообщение с message_id (чтобы файлы
// шли ответами на заявку) и отправка файлов. Цепочка: админ-бот -> основной @victour_bot
// (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID) -> ничего (заявка всё равно лежит в CRM).

type Target = { token: string; chatId: string }

export function adminTarget(): Target | null {
  if (isAdminBotConfigured()) return { token: process.env.TELEGRAM_ADMIN_BOT_TOKEN!, chatId: adminChatId() }
  const main = process.env.TELEGRAM_BOT_TOKEN
  if (main) return { token: main, chatId: process.env.TELEGRAM_CHAT_ID || adminChatId() }
  return null
}

/** HTML-сообщение админу; возвращает message_id или null */
export async function sendAdminHtml(html: string): Promise<number | null> {
  const t = adminTarget()
  if (!t) return null
  const res = await adminBotApi<{ message_id: number }>(
    "sendMessage",
    {
      chat_id: t.chatId,
      text: html.length > 4000 ? `${html.slice(0, 3990)}\n…` : html,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    },
    t.token,
  )
  return res?.message_id ?? null
}

export type SendFileOptions = { caption?: string; replyTo?: number }

async function sendFile(method: "sendDocument" | "sendPhoto", field: "document" | "photo", file: Blob, filename: string, opts: SendFileOptions) {
  const t = adminTarget()
  if (!t) return false
  const fd = new FormData()
  fd.set("chat_id", t.chatId)
  if (opts.caption) fd.set("caption", opts.caption.slice(0, 1000))
  if (opts.replyTo) fd.set("reply_parameters", JSON.stringify({ message_id: opts.replyTo, allow_sending_without_reply: true }))
  fd.set(field, file, filename)
  try {
    const res = await fetch(`https://api.telegram.org/bot${t.token}/${method}`, { method: "POST", body: fd, signal: AbortSignal.timeout(25000) })
    const data = (await res.json()) as { ok: boolean; description?: string }
    if (!data.ok) console.error(`admin-bot: ${method} failed:`, data.description)
    return data.ok
  } catch (err) {
    console.error(`admin-bot: ${method} error:`, err)
    return false
  }
}

/** Файл документом: без сжатия, паспорт читается (так и отправляем паспорта и ваучеры) */
export const sendAdminDocument = (file: Blob, filename: string, opts: SendFileOptions = {}) =>
  sendFile("sendDocument", "document", file, filename, opts)

/** Фото со сжатием Telegram (для превью, не для документов) */
export const sendAdminPhoto = (file: Blob, filename: string, opts: SendFileOptions = {}) =>
  sendFile("sendPhoto", "photo", file, filename, opts)

// Админ-бот Виктора (2026-11-14): отдельный от @victour_bot бот, в который Виктор кидает
// расписание групп (/api/group-bot) и куда приходят заявки групп и фаст-трека.
// Токен - TELEGRAM_ADMIN_BOT_TOKEN, чат - TELEGRAM_ADMIN_CHAT_ID (по умолчанию Виктор).
// Общий helper: им пользуются и групповые туры, и фаст-трек (ветка feat/fasttrack).

export const DEFAULT_ADMIN_CHAT_ID = "5843169217"

export function adminChatId(): string {
  return process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() || DEFAULT_ADMIN_CHAT_ID
}

/** Кому разрешено командовать ботом: TELEGRAM_ADMIN_IDS (через запятую) + чат админа. */
export function adminUserIds(): Set<string> {
  const extra = (process.env.TELEGRAM_ADMIN_IDS ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return new Set([adminChatId(), ...extra])
}

export function isAdminBotConfigured(): boolean {
  return !!process.env.TELEGRAM_ADMIN_BOT_TOKEN
}

export type SendAdminOptions = {
  /** Кому (по умолчанию adminChatId()) */
  chatId?: string | number
  parseMode?: "HTML" | "MarkdownV2"
  replyTo?: number
  disablePreview?: boolean
  /** Если админ-бот не настроен, отправить через основной @victour_bot (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID) */
  fallbackToMainBot?: boolean
}

/** Метод Bot API админ-бота. null - бот не настроен или запрос упал. */
export async function adminBotApi<T = unknown>(method: string, body: Record<string, unknown>, token = process.env.TELEGRAM_ADMIN_BOT_TOKEN): Promise<T | null> {
  if (!token) return null
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })
    const data = (await res.json()) as { ok: boolean; result?: T; description?: string }
    if (!data.ok) {
      console.error(`admin-bot: ${method} failed:`, data.description)
      return null
    }
    return (data.result ?? null) as T | null
  } catch (err) {
    console.error(`admin-bot: ${method} error:`, err)
    return null
  }
}

/** Сообщение админу. true - доставлено. */
export async function sendAdmin(text: string, opts: SendAdminOptions = {}): Promise<boolean> {
  const useMain = !isAdminBotConfigured() && opts.fallbackToMainBot
  const token = useMain ? process.env.TELEGRAM_BOT_TOKEN : process.env.TELEGRAM_ADMIN_BOT_TOKEN
  const chatId = opts.chatId ?? (useMain ? process.env.TELEGRAM_CHAT_ID || adminChatId() : adminChatId())
  const result = await adminBotApi(
    "sendMessage",
    {
      chat_id: chatId,
      text: text.length > 4000 ? `${text.slice(0, 3990)}\n…` : text,
      ...(opts.parseMode ? { parse_mode: opts.parseMode } : {}),
      ...(opts.replyTo ? { reply_parameters: { message_id: opts.replyTo, allow_sending_without_reply: true } } : {}),
      link_preview_options: { is_disabled: opts.disablePreview ?? true },
    },
    token,
  )
  return result !== null
}

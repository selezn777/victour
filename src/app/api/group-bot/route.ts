import { revalidatePath } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { adminUserIds, sendAdmin } from "@/lib/admin-bot"
import {
  deleteByNum,
  getByNum,
  listForBot,
  resolveTourSlug,
  seatsLeft,
  serviceDb,
  updateByNum,
  upsertDeparture,
  type DbResult,
  type GroupDeparture,
} from "@/lib/group-departures"
import { formatDateRu, parseScheduleLine, splitScheduleLines, todayInVietnam } from "@/lib/group-schedule-parse"

// Вебхук админ-бота: Виктор кидает расписание групп текстом, бот сохраняет выезды в
// group_departures и обновляет /groups. Доступ - только TELEGRAM_ADMIN_CHAT_ID / TELEGRAM_ADMIN_IDS.
// Telegram всегда получает 200, иначе он будет слать то же сообщение снова.

const HELP = `Кидайте расписание, по выезду на строку:
20.11 Юг 2.0 9:00 гид Виктор 8 мест $60
22.11 Острова 7:30 10 мест 45$ занято 3

Тот же день + тур + время ещё раз = обновить выезд.

Команды (N - номер выезда из списка):
/list - ближайшие выезды
/seats N 5 - занято 5 мест (можно +2 или -1)
/total N 12 - всего мест 12
/price N 55 - цена с человека
/guide N Саша - сменить гида
/cancel N - отменить (скроется с сайта)
/open N - вернуть отменённый
/del N - удалить совсем`

type TgUpdate = {
  message?: { message_id: number; text?: string; chat: { id: number }; from?: { id: number } }
}

const ok = () => Response.json({ ok: true })

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_ADMIN_WEBHOOK_SECRET
  if (!secret || request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("forbidden", { status: 403 })
  }

  let update: TgUpdate
  try {
    update = (await request.json()) as TgUpdate
  } catch {
    return ok()
  }
  const msg = update.message
  if (!msg?.text) return ok()

  const chatId = msg.chat.id
  const reply = (text: string) => sendAdmin(text, { chatId, replyTo: msg.message_id })

  if (!adminUserIds().has(String(msg.from?.id ?? chatId))) {
    await reply("Это служебный бот ВикТур. Записаться в группу можно на сайте: victour.online/groups")
    return ok()
  }

  const db = serviceDb()
  if (!db) {
    await reply("На сервере не настроена база (SUPABASE_SERVICE_ROLE_KEY).")
    return ok()
  }

  try {
    const answer = await handle(db, msg.text.trim())
    await reply(answer.text)
    if (answer.changed) revalidatePath("/groups")
  } catch (err) {
    console.error("group-bot: handler error:", err)
    await reply("Что-то сломалось на сервере, попробуйте ещё раз через минуту.")
  }
  return ok()
}

const MIGRATION_HINT = "Таблицы групп ещё нет в базе: нужно применить миграцию 20261114120000_group_departures.sql."

function dbError(r: { missingTable: boolean; error: string }): string {
  return r.missingTable ? MIGRATION_HINT : `Ошибка базы: ${r.error}`
}

function departureLine(d: GroupDeparture, signupsNew = 0): string {
  const parts = [
    `#${d.num}`,
    formatDateRu(d.date),
    d.time ?? "время ?",
    d.tourTitle,
    d.guideName ? `гид ${d.guideName}` : null,
    `занято ${d.seatsBooked}/${d.seatsTotal}${seatsLeft(d) === 0 ? " (собрана)" : ""}`,
    d.priceUsd !== null ? `$${d.priceUsd}` : null,
    d.status === "cancelled" ? "ОТМЕНЁН" : null,
    signupsNew ? `новых заявок: ${signupsNew} чел.` : null,
  ]
  return parts.filter(Boolean).join(" · ")
}

type Answer = { text: string; changed: boolean }

async function handle(db: SupabaseClient, text: string): Promise<Answer> {
  const cmd = text.match(/^\/?([a-zа-яё]+)(?:@\w+)?(?:\s+(.*))?$/i)
  const name = cmd?.[1].toLowerCase()
  const args = (cmd?.[2] ?? "").trim()

  if (cmd && ["start", "help", "помощь", "старт"].includes(name!)) return { text: HELP, changed: false }

  if (cmd && ["list", "список", "группы", "выезды"].includes(name!)) {
    const r = await listForBot(db)
    if (!r.ok) return { text: dbError(r), changed: false }
    if (!r.value.departures.length) return { text: "Ближайших выездов нет. Кидайте расписание.", changed: false }
    return {
      text: ["Ближайшие выезды:", ...r.value.departures.map((d) => departureLine(d, r.value.signups[d.id]))].join("\n"),
      changed: false,
    }
  }

  const numCmd = cmd && text.startsWith("/") ? name : cmd && ["удалить", "отменить", "вернуть", "места", "занято", "всего", "цена", "гид"].includes(name!) ? name : null
  if (numCmd) return numberCommand(db, numCmd, args)

  return scheduleLines(db, text)
}

async function numberCommand(db: SupabaseClient, name: string, args: string): Promise<Answer> {
  const m = args.match(/^#?(\d+)\s*(.*)$/)
  if (!m) return { text: `Нужен номер выезда, например /${name} 12. Номера в /list.`, changed: false }
  const num = Number(m[1])
  const value = m[2].trim()

  const current = await getByNum(db, num)
  if (!current.ok) return { text: dbError(current), changed: false }
  const d = current.value
  if (!d) return { text: `Выезда #${num} нет. Номера в /list.`, changed: false }

  const done = (r: DbResult<GroupDeparture | null>, prefix: string): Answer =>
    r.ok && r.value ? { text: `${prefix}\n${departureLine(r.value)}`, changed: true } : { text: r.ok ? `Выезда #${num} нет.` : dbError(r), changed: false }

  const int = (s: string) => (/^\d{1,3}$/.test(s) ? Number(s) : null)

  switch (name) {
    case "del":
    case "delete":
    case "удалить": {
      const r = await deleteByNum(db, num)
      return r.ok ? { text: `Удалил: ${departureLine(d)}`, changed: true } : { text: dbError(r), changed: false }
    }
    case "cancel":
    case "отменить":
      return done(await updateByNum(db, num, { status: "cancelled" }), "Отменил, на сайте больше не видно:")
    case "open":
    case "вернуть":
      return done(await updateByNum(db, num, { status: "open" }), "Вернул на сайт:")
    case "seats":
    case "места":
    case "занято": {
      const rel = value.match(/^([+-])\s*(\d{1,3})$/)
      const next = rel ? d.seatsBooked + (rel[1] === "+" ? 1 : -1) * Number(rel[2]) : int(value)
      if (next === null) return { text: `Сколько занято? Например /seats ${num} 5 или /seats ${num} +2`, changed: false }
      if (next < 0) return { text: "Меньше нуля занятых мест не бывает.", changed: false }
      if (next > d.seatsTotal) return { text: `Мест всего ${d.seatsTotal}. Если группа больше, сначала /total ${num} ${next}`, changed: false }
      return done(await updateByNum(db, num, { seats_booked: next }), "Места обновил:")
    }
    case "total":
    case "всего": {
      const next = int(value)
      if (!next) return { text: `Сколько всего мест? Например /total ${num} 12`, changed: false }
      if (next < d.seatsBooked) return { text: `Уже занято ${d.seatsBooked}, меньше нельзя.`, changed: false }
      return done(await updateByNum(db, num, { seats_total: next }), "Мест всего теперь:")
    }
    case "price":
    case "цена": {
      const next = int(value.replace(/[$\s]|usd/gi, ""))
      if (next === null) return { text: `Какая цена? Например /price ${num} 55`, changed: false }
      return done(await updateByNum(db, num, { price_usd: next }), "Цену обновил:")
    }
    case "guide":
    case "гид": {
      if (!value) return { text: `Какой гид? Например /guide ${num} Виктор`, changed: false }
      return done(await updateByNum(db, num, { guide_name: value.slice(0, 40) }), "Гида сменил:")
    }
    default:
      return { text: `Не знаю команду /${name}.\n\n${HELP}`, changed: false }
  }
}

async function scheduleLines(db: SupabaseClient, text: string): Promise<Answer> {
  const lines = splitScheduleLines(text).slice(0, 40)
  const today = todayInVietnam()
  const out: string[] = []
  let changed = false
  let saved = 0
  for (const line of lines) {
    const p = parseScheduleLine(line, today)
    if (!p.ok) {
      out.push(`❌ «${line}»: ${p.error}`)
      continue
    }
    const slug = await resolveTourSlug(db, p.value.tourTitle)
    const r = await upsertDeparture(db, p.value, slug)
    if (!r.ok) {
      if (r.missingTable) return { text: MIGRATION_HINT, changed: false }
      out.push(`❌ «${line}»: ошибка базы ${r.error}`)
      continue
    }
    changed = true
    saved++
    out.push(`${r.value.created ? "✅ Новый" : "♻️ Обновил"}: ${departureLine(r.value.departure)}`)
  }
  if (!saved && lines.length === 1 && !/^\d{1,2}[./]\d{1,2}/.test(lines[0])) {
    return { text: `Не понял. Расписание пишется так:\n20.11 Юг 2.0 9:00 гид Виктор 8 мест $60\n\nВсе команды: /help`, changed: false }
  }
  if (saved) out.push("", "На сайте обновится в течение минуты: victour.online/groups")
  return { text: out.join("\n"), changed }
}

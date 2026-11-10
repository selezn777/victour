// Поле note в crm_clients хранит три вещи (без миграции базы, Виктор 2026-11-10):
// - свободную заметку;
// - строку «Старший группы: имя, телефон» (для фаст-трека);
// - историю комментариев: строки «[2026-11-10 18:40] текст».

export type ParsedNote = { body: string; leader: string; comments: { at: string; text: string }[] }

const COMMENT = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\] (.*)$/
const LEADER = /^Старший группы: (.*)$/

export function parseNote(note: string | null): ParsedNote {
  const body: string[] = []
  const comments: ParsedNote["comments"] = []
  let leader = ""
  for (const line of (note ?? "").split("\n")) {
    const c = line.match(COMMENT)
    const l = line.match(LEADER)
    if (c) comments.push({ at: c[1], text: c[2] })
    else if (l) leader = l[1].trim()
    else body.push(line)
  }
  return { body: body.join("\n").trim(), leader, comments }
}

export function buildNote(p: ParsedNote): string | null {
  const lines = [
    p.body.trim(),
    p.leader.trim() ? `Старший группы: ${p.leader.trim()}` : "",
    ...p.comments.map((c) => `[${c.at}] ${c.text.replace(/\n+/g, " ").trim()}`),
  ].filter(Boolean)
  return lines.length ? lines.join("\n") : null
}

/** Время по Вьетнаму: «2026-11-10 18:40» */
export function nowStamp(): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  )
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`
}

/** «10 нояб., 18:40» */
export function stampRu(at: string): string {
  const [d, t] = at.split(" ")
  return `${new Date(`${d}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}, ${t}`
}

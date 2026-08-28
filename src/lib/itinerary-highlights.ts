// Триггерные туристические слова/корни для подсветки в описаниях маршрута
// (Виктор: "тригерные туристические слова где ярким выделить"). Корень
// вместо целого слова — чтобы ловить любые падежи/формы одним пунктом
// (капибар -> капибары/капибарами), без ручного перечисления склонений.
const TRIGGER_STEMS = [
  "капибар",
  "альпак",
  "слон",
  "страус",
  "макак",
  "дракон",
  "легенд",
  "золот",
  "будда",
  "древн",
  "наследи",
  "гранитн",
  "пагод",
  "собор",
  "неоготическ",
  "витраж",
  "остров",
  "дик",
  "горн",
  "панорам",
  "гималайск",
  "рекорд",
  "guinness",
  "крупнейш",
  "водопад",
  "канатн",
  "стеклянн",
  "лазерн",
  "копи-лувак",
  "private",
  "катер",
  "скоростн",
  "минеральн",
  "грязев",
  "эко-парк",
]

const HIGHLIGHT_PATTERN = new RegExp(`(${TRIGGER_STEMS.join("|")})[а-яё]*`, "gi")

/** Разбивает текст на куски {text, highlighted} по триггерным словам — рендерить самостоятельно, без dangerouslySetInnerHTML. */
export function splitHighlights(text: string): { text: string; highlighted: boolean }[] {
  if (!text) return []
  const parts: { text: string; highlighted: boolean }[] = []
  let lastIndex = 0
  for (const match of text.matchAll(HIGHLIGHT_PATTERN)) {
    const index = match.index ?? 0
    if (index > lastIndex) parts.push({ text: text.slice(lastIndex, index), highlighted: false })
    parts.push({ text: match[0], highlighted: true })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), highlighted: false })
  return parts
}

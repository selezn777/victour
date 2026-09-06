export const ARTICLE_DESTINATIONS: Record<string, string> = {
  "kam-ranh": "Камрань",
  vinpearl: "Винперл",
  nyachang: "Нячанг",
  "dai-lan": "Маяк Дай Лань",
  other: "Другое",
}

export function destinationLabel(code: string): string {
  return ARTICLE_DESTINATIONS[code] ?? code
}

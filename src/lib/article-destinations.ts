export const ARTICLE_DESTINATIONS: Record<string, string> = {
  "kam-ranh": "Камрань",
  vinpearl: "Винперл",
  other: "Другое",
}

export function destinationLabel(code: string): string {
  return ARTICLE_DESTINATIONS[code] ?? code
}

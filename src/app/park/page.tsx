import type { Metadata, Viewport } from "next"
import { HonTamContent } from "./hontam-content"
import { Landing } from "./landing"
import { VinWondersContent } from "./vinwonders-content"
import { lora, manrope } from "./fonts"

// Отдельный светлый промо-лендинг (основной сайт тёмный). Стиль и тексты —
// из утверждённого флаера park-landing/design/, данные — из park-config.ts.
// Переключатель вверху: VinWonders (канатка) ↔ остров Хон Там, у каждого
// своя палитра (ui.tsx → THEMES) и свои билеты в форме.

export const metadata: Metadata = {
  metadataBase: new URL("https://victour.vercel.app"),
  title: "Официальные билеты в парк + бесплатный трансфер | ВикТур",
  description:
    "Билеты в VinWonders по официальным ценам и бесплатный трансфер от отеля до канатной дороги. Остров Хон Там с трансфером от $17. Бронирование и отмена — бесплатно.",
}

export const viewport: Viewport = {
  themeColor: "#f4ead8",
}

export default function ParkPage() {
  return (
    <div className={`${lora.variable} ${manrope.variable} flex flex-1 flex-col`}>
      <Landing content={{ park: <VinWondersContent />, hontam: <HonTamContent /> }} />
    </div>
  )
}

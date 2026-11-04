import type { Metadata, Viewport } from "next"
import { Landing } from "../park/landing"
import { REGION_ORDER } from "../park/park-config"
import { lora, manrope } from "../park/fonts"
import { PqHonThomContent } from "./honthom-content"
import { PqVinContent } from "./vin-content"

// Билеты Фукуока: тот же лендинг, что /park в Нячанге (форма, заявка в
// Telegram, подтверждение выезда), но свои направления и платный трансфер
// по району отеля. Вкладки: VinWonders/Сафари ↔ канатка Хон Тхом (?t=pq_honthom).

export const metadata: Metadata = {
  metadataBase: new URL("https://victour.vercel.app"),
  title: "Билеты VinWonders, Сафари и канатка Хон Тхом на Фукуоке | ВикТур",
  description:
    "Официальные билеты в VinWonders, Vinpearl Safari и на канатную дорогу Хон Тхом. Выкупаем заранее, личный трансфер от отеля по себестоимости. Бронирование бесплатно.",
}

export const viewport: Viewport = {
  themeColor: "#f7ebdc",
}

export default function PhuQuocParkPage() {
  return (
    <div className={`${lora.variable} ${manrope.variable} flex flex-1 flex-col`}>
      <Landing
        order={REGION_ORDER.phuquoc}
        content={{ pq_vin: <PqVinContent />, pq_honthom: <PqHonThomContent /> }}
      />
    </div>
  )
}

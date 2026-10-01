import { Lora, Manrope } from "next/font/google"

export const lora = Lora({
  variable: "--font-park-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["700"],
  style: ["normal", "italic"],
})

export const manrope = Manrope({
  variable: "--font-park-sans",
  subsets: ["latin", "cyrillic"],
})

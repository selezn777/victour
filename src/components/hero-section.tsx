"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"

const PROMISES = [
  "Премиальные авто с массажными креслами",
  "Только ваша компания — без случайных попутчиков",
  "Внимательные личные гиды, а не гид на автобус",
  "Еда по вашему выбору — без туристических столовых",
  "Свой темп — без магазинов для туристов и лишних остановок",
]

const EASE = [0.16, 1, 0.3, 1] as const

export function HeroSection() {
  return (
    <section className="relative flex h-[calc(100svh-3.5rem)] min-h-[560px] flex-col justify-end overflow-hidden sm:h-[calc(100svh-4rem)]">
      <Image
        src="/images/hero/premium-van-interior.jpg"
        alt="Премиальный салон минивэна с массажными креслами для private-туров"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 text-white sm:px-6 sm:pb-16">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-heading text-4xl leading-none font-semibold italic sm:text-6xl"
        >
          Вьетнам без чужих
        </motion.h1>

        <ul className="mt-5 flex max-w-xl flex-col gap-1.5 text-sm text-white/85 sm:mt-6 sm:text-base">
          {PROMISES.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.08, ease: EASE }}
              className="flex gap-2"
            >
              <span className="text-primary">—</span>
              {item}
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75, ease: EASE }}
        >
          <Button size="lg" className="mt-6 sm:mt-8" nativeButton={false} render={<Link href="#catalog" />}>
            Смотреть туры
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

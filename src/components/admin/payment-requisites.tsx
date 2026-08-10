"use client"

import { useState } from "react"
import Image from "next/image"

// Реальные банковские реквизиты Виктора — не публикуются на сайте, показываются
// только здесь, на странице /admin/bookings (гейтится Google-логином и is_admin() в БД).
// Картинка QR — в Vercel Blob, не в git-репозитории (репозиторий публичный на GitHub).
const ADMIN_PHONE = "+79028651113"
const ADMIN_NAME = "Селезнев Виктор Владимирович"
const ADMIN_QR_URL =
  "https://our41hywrmbsqagk.public.blob.vercel-storage.com/admin/payment-qr-v7R0nr5aGBgJoUQmgAiOI6FUI03d1y.jpg"

export function PaymentRequisites({ amountRub }: { amountRub: number }) {
  const [copied, setCopied] = useState(false)

  async function copyPhone() {
    await navigator.clipboard.writeText(ADMIN_PHONE)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <details className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      <summary className="cursor-pointer text-sm font-medium">
        Реквизиты для предоплаты (переслать гостю лично)
      </summary>
      <div className="mt-4 flex flex-wrap items-start gap-4">
        <Image
          src={ADMIN_QR_URL}
          alt="QR для перевода"
          width={140}
          height={140}
          className="rounded-lg border border-border"
          unoptimized
        />
        <div className="flex flex-col gap-2">
          <div>
            <div className="font-heading text-2xl font-semibold text-primary">
              {Math.round(amountRub).toLocaleString("ru-RU")} ₽
            </div>
            <p className="text-xs text-muted-foreground">Сумма предоплаты</p>
          </div>
          <button
            type="button"
            onClick={copyPhone}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-left text-sm hover:bg-muted"
          >
            <span className="font-medium">{ADMIN_PHONE}</span>
            <span className="text-xs text-muted-foreground">
              {copied ? "Скопировано" : "Скопировать"}
            </span>
          </button>
          <p className="text-xs text-muted-foreground">{ADMIN_NAME}</p>
        </div>
      </div>
    </details>
  )
}

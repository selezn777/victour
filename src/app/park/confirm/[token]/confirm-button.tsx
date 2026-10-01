"use client"

import { useState } from "react"

export function ConfirmButton({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">("idle")

  async function confirm() {
    setStatus("sending")
    try {
      const res = await fetch("/api/park-booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      setStatus(res.ok ? "done" : "failed")
    } catch {
      setStatus("failed")
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-[24px] bg-white p-5 text-center shadow-[0_8px_24px_rgb(60_60_40/0.11)]">
        <div className="text-[40px] leading-none">✅</div>
        <p className="mt-2 font-(family-name:--font-park-serif) text-[22px] font-bold text-(--c-primary)">
          Выезд подтверждён!
        </p>
        <p className="mt-1 text-[14px] text-(--c-muted)">Водитель будет у отеля вовремя. Хорошей поездки!</p>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={confirm}
        disabled={status === "sending"}
        className="h-16 w-full rounded-full bg-(--c-accent) text-[18px] font-extrabold text-white shadow-[0_10px_24px_rgb(0_0_0/0.2)] active:scale-[0.99] disabled:opacity-60"
      >
        {status === "sending" ? "Отправляем…" : "✅ Подтверждаю выезд"}
      </button>
      {status === "failed" && (
        <p className="text-center text-[14px] font-semibold text-[#b3402a]">
          Не получилось отправить — напишите нам в WhatsApp, кнопка ниже.
        </p>
      )}
    </>
  )
}

"use client"

export const ADD_EXTRA_EVENT = "victour:park-add-extra"

// Кнопка из блока Seawalking: отмечает Seawalking в форме и прокручивает к ней
export function SeawalkingCta() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(ADD_EXTRA_EVENT, { detail: "seawalking" }))
        document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })
      }}
      className="mt-4 flex h-14 w-full shadow-[0_8px_20px_rgb(0_0_0/0.18)] active:scale-[0.99] items-center justify-center gap-2 rounded-full bg-(--c-accent) text-[16px] font-extrabold text-white"
    >
      🤿 Забронировать с Seawalking
    </button>
  )
}

"use client"

import PhoneInputBase, { type Value } from "react-phone-number-input"
import ru from "react-phone-number-input/locale/ru.json"
import "react-phone-number-input/style.css"

import { cn } from "@/lib/utils"

export function PhoneInput({
  value,
  onChange,
  className,
  autoFocus,
  onKeyDown,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  autoFocus?: boolean
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}) {
  return (
    <PhoneInputBase
      international
      defaultCountry="RU"
      labels={ru}
      value={value as Value}
      onChange={(v) => onChange(v ?? "")}
      className={cn("phone-input", className)}
      numberInputProps={{ autoFocus, onKeyDown }}
    />
  )
}

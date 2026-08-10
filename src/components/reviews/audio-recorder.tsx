"use client"

import { useEffect, useRef, useState } from "react"
import { MicIcon, SquareIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"

const MAX_DURATION_SECONDS = 90

export function AudioRecorder({
  onChange,
}: {
  onChange: (blob: Blob | null) => void
}) {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onChange(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
      setSeconds(0)

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_DURATION_SECONDS) {
            recorder.stop()
            if (timerRef.current) clearInterval(timerRef.current)
            setRecording(false)
          }
          return s + 1
        })
      }, 1000)
    } catch {
      setError("Не удалось получить доступ к микрофону. Проверьте разрешения браузера.")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
  }

  function reset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    onChange(null)
    setSeconds(0)
  }

  if (audioUrl) {
    return (
      <div className="flex items-center gap-2">
        <audio controls src={audioUrl} className="h-9 flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={reset}>
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={recording ? stopRecording : startRecording}
        className="w-fit"
      >
        {recording ? (
          <>
            <SquareIcon className="size-4 fill-current" />
            Остановить ({seconds}с)
          </>
        ) : (
          <>
            <MicIcon className="size-4" />
            Записать голосовой отзыв
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

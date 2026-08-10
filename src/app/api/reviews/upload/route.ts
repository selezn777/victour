import { put } from "@vercel/blob"

const MAX_PHOTO_BYTES = 8 * 1024 * 1024
const MAX_AUDIO_BYTES = 6 * 1024 * 1024

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")
  const kind = formData.get("kind")

  if (!(file instanceof File) || (kind !== "photo" && kind !== "audio")) {
    return Response.json({ ok: false, error: "bad request" }, { status: 400 })
  }

  const maxBytes = kind === "audio" ? MAX_AUDIO_BYTES : MAX_PHOTO_BYTES
  if (file.size > maxBytes) {
    return Response.json({ ok: false, error: "file too large" }, { status: 413 })
  }

  const ext = kind === "audio" ? "webm" : (file.type.split("/")[1] ?? "jpg")
  const blob = await put(`reviews/${kind}/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return Response.json({ ok: true, url: blob.url })
}

import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

const MAX_PHOTO_BYTES = 8 * 1024 * 1024
const ADMIN_EMAIL = "selezn.777@gmail.com"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "bad request" }, { status: 400 })
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return Response.json({ ok: false, error: "file too large" }, { status: 413 })
  }

  const ext = file.type.split("/")[1] ?? "jpg"
  const blob = await put(`articles/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return Response.json({ ok: true, url: blob.url })
}

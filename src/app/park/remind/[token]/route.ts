import { reminderRu } from "@/app/park/park-texts"
import { readConfirmToken } from "@/lib/park-confirm"

// Ссылка из заявки в Telegram: Виктор нажимает — открывается WhatsApp-чат с
// туристом с готовым напоминанием «подтвердите выезд за час» по-русски.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const data = readConfirmToken(decodeURIComponent(token))
  if (!data?.phone) return new Response("Invalid link", { status: 400 })

  const confirmUrl = `${new URL(request.url).origin}/park/confirm/${token}`
  const text = reminderRu(data, confirmUrl)
  return Response.redirect(
    `https://wa.me/${data.phone.replace("+", "")}?text=${encodeURIComponent(text)}`,
    302,
  )
}

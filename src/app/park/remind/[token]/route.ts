import { waTextLink } from "@/app/park/park-config"
import { reminderRu } from "@/app/park/park-texts"
import { readConfirmToken, resolveLinkParam } from "@/lib/park-confirm"

// Ссылка из заявки в Telegram: Виктор нажимает — открывается WhatsApp-чат с
// туристом с готовым напоминанием «подтвердите выезд за час» по-русски.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const full = await resolveLinkParam(token)
  const data = full ? readConfirmToken(full) : null
  if (!data?.phone) return new Response("Invalid link", { status: 400 })

  // Короткий id → короткая ссылка /c/<id>, старые заявки — длинная
  const origin = new URL(request.url).origin
  const confirmUrl = full === token ? `${origin}/park/confirm/${token}` : `${origin}/c/${token}`
  const text = reminderRu(data, confirmUrl)
  return Response.redirect(waTextLink(data.phone, text), 302)
}

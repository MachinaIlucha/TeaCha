export async function onRequestPost({ request, env }) {
  let data = {}
  try {
    data = await request.json()
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Bad JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    })
  }

  const name = String(data.name || "").trim()
  const contact = String(data.contact || "").trim()
  const email = String(data.email || "").trim()

  if (!name || !contact) {
    return new Response(JSON.stringify({ ok: false, error: "Name/contact required" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    })
  }

  const token = env.TG_BOT_TOKEN
  const chatId = env.TG_CHAT_ID
  if (!token || !chatId) {
    return new Response(JSON.stringify({ ok: false, error: "Missing env vars" }), {
      status: 500,
      headers: { "content-type": "application/json" }
    })
  }

  const text =
`🧾 Нова заявка TeaCha
👤 Ім'я: ${name}
📞 Контакт: ${contact}
✉️ Email: ${email || "—"}`

  const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  })

  if (!tg.ok) {
    const detail = await tg.text().catch(() => "")
    return new Response(JSON.stringify({ ok: false, error: "Telegram error", detail }), {
      status: 502,
      headers: { "content-type": "application/json" }
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  })
}

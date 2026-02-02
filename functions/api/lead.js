const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const clamp = (s, n) => String(s ?? "").slice(0, n);

const cleanLine = (s, max = 120) =>
  clamp(String(s ?? "").replace(/\s+/g, " ").trim(), max);

const cleanMultiline = (s, max = 400) => clamp(String(s ?? "").trim(), max);

export async function onRequestPost({ request, env }) {
  let data = {};
  try {
    data = await request.json();
  } catch {
    return json(400, { ok: false, code: "BAD_JSON" });
  }

  const name = cleanLine(data?.name);
  const contact = cleanMultiline(data?.contact);
  const source = cleanLine(data?.source || "unknown", 60);

  if (!name || !contact) {
    return json(400, { ok: false, code: "VALIDATION" });
  }

  const token = env?.TG_BOT_TOKEN;
  const chatId = env?.TG_CHAT_ID;

  if (!token || !chatId) {
    return json(500, { ok: false, code: "SERVER_CONFIG" });
  }

  const text =
    `🧾 Нова заявка TeaCha\n` +
    `👤 Ім'я: ${name}\n` +
    `📞 Контакт: ${contact}\n` +
    `🏷️ Source: ${source}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const tgJson = await tgRes.json().catch(() => null);

    if (!tgRes.ok || !tgJson?.ok) {
      return json(502, {
        ok: false,
        code: "UPSTREAM",
        detail: tgJson || { status: tgRes.status },
      });
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error("Telegram request failed", err);
    return json(502, { ok: false, code: "UPSTREAM" });
  }
}

import { toast } from "../core/toast.js"
import { getClientText } from "../core/site-text.js";

const text = getClientText();

const userMessageByCode = (code) => {
  switch (code) {
    case "VALIDATION":
      return text.lead.api.validation
    case "BAD_REQUEST":
      return text.lead.api.badRequest
    case "UPSTREAM":
      return text.lead.api.upstream
    case "SERVER_CONFIG":
      return text.lead.api.serverConfig
    default:
      return text.lead.api.fallback
  }
}

export const postLead = async ({ name, contact, source }) => {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, contact, source })
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok || !json.ok) {
    toast.error(text.lead.api.failedTitle, userMessageByCode(json?.code))
    console.error("Lead submit failed", { status: res.status, json })
    return { ok: false, json, status: res.status }
  }

  toast.success(text.lead.api.successTitle, text.lead.api.successText)
  return { ok: true, json, status: res.status }
}

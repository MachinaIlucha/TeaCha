import { toast } from "../core/toast.js"

const userMessageByCode = (code) => {
  switch (code) {
    case "VALIDATION":
      return "Перевірте ім'я та контакт"
    case "BAD_REQUEST":
      return "Не вдалося обробити дані форми"
    case "UPSTREAM":
      return "Сервіс тимчасово недоступний. Спробуйте пізніше"
    case "SERVER_CONFIG":
      return "Технічні роботи. Спробуйте трохи пізніше"
    default:
      return "Не вдалося надіслати заявку. Спробуйте ще раз"
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
    toast.error("Не надіслано", userMessageByCode(json?.code))
    console.error("Lead submit failed", { status: res.status, json })
    return { ok: false, json, status: res.status }
  }

  toast.success("Надіслано", "Ми скоро напишемо вам 🙂")
  return { ok: true, json, status: res.status }
}

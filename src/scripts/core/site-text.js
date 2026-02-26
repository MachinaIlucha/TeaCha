const DEFAULT_SITE_TEXT = {
  toast: {
    closeAria: "Закрити",
  },
  lead: {
    api: {
      validation: "Перевірте ім'я та контакт",
      badRequest: "Не вдалося обробити дані форми",
      upstream: "Сервіс тимчасово недоступний. Спробуйте пізніше",
      serverConfig: "Технічні роботи. Спробуйте трохи пізніше",
      fallback: "Не вдалося надіслати заявку. Спробуйте ще раз",
      failedTitle: "Не надіслано",
      successTitle: "Надіслано",
      successText: "Ми скоро напишемо вам 🙂",
    },
    bind: {
      sendingButton: "Відправляємо…",
      fallbackSubmitButton: "ЗАЛИШИТИ ЗАЯВКУ",
      errorTitle: "Помилка",
      errorText: "Не вдалося надіслати заявку. Спробуйте ще раз",
    },
    validation: {
      requiredName: "Введіть імʼя",
      requiredContact: "Введіть телефон або Telegram",
      requiredConsent: "Потрібно підтвердити згоду",
      invalidName: "Імʼя має містити щонайменше 2 літери",
      invalidNameToastTitle: "Перевірте ім'я",
      invalidNameToastText: "Мінімум 2 символи. Лише букви, пробіл, ' та ,",
      invalidPhone: "Формат: +380XXXXXXXXX",
      invalidPhoneToastTitle: "Перевірте телефон",
      invalidPhoneToastText: "Формат: +380XXXXXXXXX (9 цифр після 380)",
      invalidTelegram: "Формат: @username (5–32 символи)",
      invalidTelegramToastTitle: "Перевірте Telegram",
      invalidTelegramToastText: "Формат: @username (5–32 символи: букви/цифри/_)",
      invalidContact: "Вкажіть телефон (+380…) або Telegram (@username)",
      invalidContactToastTitle: "Перевірте контакт",
      invalidContactToastText: "Вкажіть телефон (+380…) або Telegram (@username)",
    },
  },
  reviews: {
    requestLabel: "Запит:",
    pointADefault: "Точка А",
    pointBDefault: "Точка Б",
    photoAltPrefix: "Фото: ",
  },
};

let cachedText = null;

const getParsedText = () => {
  const node = document.getElementById("teacha-client-text");
  if (!node) return {};

  try {
    return JSON.parse(node.textContent || "{}");
  } catch {
    return {};
  }
};

export const getClientText = () => {
  if (cachedText) return cachedText;

  const parsed = getParsedText();
  cachedText = {
    toast: {
      ...DEFAULT_SITE_TEXT.toast,
      ...(parsed.toast || {}),
    },
    lead: {
      api: {
        ...DEFAULT_SITE_TEXT.lead.api,
        ...((parsed.lead && parsed.lead.api) || {}),
      },
      bind: {
        ...DEFAULT_SITE_TEXT.lead.bind,
        ...((parsed.lead && parsed.lead.bind) || {}),
      },
      validation: {
        ...DEFAULT_SITE_TEXT.lead.validation,
        ...((parsed.lead && parsed.lead.validation) || {}),
      },
    },
    reviews: {
      ...DEFAULT_SITE_TEXT.reviews,
      ...(parsed.reviews || {}),
    },
  };

  return cachedText;
};

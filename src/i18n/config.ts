import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./resources/en.json";
import viTranslation from "./resources/vi.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "vi", // Lấy từ localStorage hoặc mặc định là 'vi'
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Lưu ngôn ngữ vào localStorage khi thay đổi
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export default i18n;

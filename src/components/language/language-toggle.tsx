import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "en", name: "ENGLISH", flag: "US" },
  { code: "vi", name: "TIẾNG VIỆT", flag: "VN" },
];

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language);

  return (
    <Button
      onClick={toggleLanguage}
      className='flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] hover:bg-[var(--pl-bg-hover)] transition-colors cursor-pointer'
    >
      <span>{currentLanguage?.flag}</span>
    </Button>
  );
};

export default LanguageToggle;

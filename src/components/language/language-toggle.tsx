import { Check } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
    { code: 'en', name: 'ENGLISH', flag: 'US' },
    { code: 'vi', name: 'TIẾNG VIỆT', flag: 'VN' },
]

export function LanguageToggle() {
    const { i18n } = useTranslation()

    const changeLanguage = (languageCode: string) => {
        i18n.changeLanguage(languageCode)
    }

    const currentLanguage = languages.find(lang => lang.code === i18n.language)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="default"
                    className="rounded-full w-16 border-2 shadow-lg cursor-pointer"
                >
                    <span>{currentLanguage?.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-46 mt-2 bg-card rounded-xl shadow-2xl border-2"
            >
                <div className="space-y-1">
                    {languages.map((lang) => (
                        <Button
                            variant="ghost"
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`
                                w-full flex items-center justify-between px-4 py-2 rounded-lg 
                                transition-all duration-200 hover:bg-accent 
                                ${i18n.language === lang.code ? 'bg-accent' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm">{lang.flag}</span>
                                <span className="font-bold text-sm tracking-wide">{lang.name}</span>
                            </div>
                            {i18n.language === lang.code && (
                                <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                            )}
                        </Button>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
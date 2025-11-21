import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ModeToggle } from "@/components/theme/mode-toggle";
import { LanguageToggle } from '@/components/language/language-toggle';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    onSearch?: (query: string) => void;
}

export default function HeaderSet({ onSearch }: HeaderProps) {
    const { t } = useTranslation();
    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className={`text-4xl font-bold`}>
                {t('setlist.title')}
            </h1>
            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="bg-card pl-10 pr-4 py-2 w-80 rounded-full border border-muted-foreground"
                    />
                </div>

                <div className="flex w-full justify-between px-4 gap-4">
                    <ModeToggle />
                    <LanguageToggle />
                </div>
            </div>
        </div>
    );
};
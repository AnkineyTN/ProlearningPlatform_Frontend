import { Check, Info } from 'lucide-react';
import SwitchButton from './SwitchButton';

export default function LanguageSelection({
    selectedLanguage,
    onLanguageSelect,
    onNext,
    onBack
}: {
    selectedLanguage: string;
    onLanguageSelect: (lang: string) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-3">Select Your Language</h1>
                    <p className="text-muted-foreground">Choose the language you'd like to use for your learning experience</p>
                </div>

                <div className="space-y-4 mb-8">
                    <button
                        onClick={() => onLanguageSelect('en')}
                        className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${selectedLanguage === 'en'
                            ? 'border-blue-500 bg-card-selected'
                            : 'border-ring bg-card-secondary hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">🇺🇸</span>
                            <div className="text-left">
                                <div className="text-sm text-muted-foreground">EN</div>
                                <div className="font-semibold text-foreground">English</div>
                            </div>
                        </div>
                        {selectedLanguage === 'en' && (
                            <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-background" />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => onLanguageSelect('vi')}
                        className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${selectedLanguage === 'vi'
                            ? 'border-blue-500 bg-card-selected'
                            : 'border-ring bg-card-secondary hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">🇻🇳</span>
                            <div className="text-left">
                                <div className="text-sm text-muted-foreground">VI</div>
                                <div className="font-semibold text-foreground">Tiếng Việt</div>
                            </div>
                        </div>
                        {selectedLanguage === 'vi' && (
                            <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-background" />
                            </div>
                        )}
                    </button>
                </div>

                <div className="bg-card rounded-xl p-4 flex items-start gap-3 mb-8">
                    <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">You can change your language preference anytime in your account settings.</p>
                </div>

                <SwitchButton onPre={onBack} onNext={onNext} disablePre={!selectedLanguage} />
            </div>
        </div>
    );
};
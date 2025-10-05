import { Check } from 'lucide-react';
import SwitchButton from './SwitchButton';

export default function EducationSelection({
    selectedEducation,
    onEducationSelect,
    onNext,
    onBack
}: {
    selectedEducation: string;
    onEducationSelect: (edu: string) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const educationLevels = [
        'High School',
        'Undergraduate',
        'Graduate',
        'Professional',
        'Other'
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-3">What is your education?</h1>
                    <p className="text-muted-foreground">Help us personalize your learning experience</p>
                </div>

                <div className="space-y-3 mb-8">
                    {educationLevels.map((level) => (
                        <button
                            key={level}
                            onClick={() => onEducationSelect(level)}
                            className={`w-full p-5 rounded-xl border-2 transition-all text-left ${selectedEducation === level
                                ? 'border-blue-500 bg-card-selected'
                                : 'border-ring bg-card-secondary hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">{level}</span>
                                {selectedEducation === level && (
                                    <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-background" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <SwitchButton
                    onPre={onBack}
                    onNext={onNext}
                    disablePre={!selectedEducation}
                />
            </div>
        </div>
    );
};
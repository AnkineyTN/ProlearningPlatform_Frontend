import { Check, GraduationCap, BookOpen, Award, Briefcase, MoreHorizontal } from 'lucide-react';
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
        {
            id: 'High School',
            label: 'High School',
            description: 'Secondary education completion',
            icon: GraduationCap
        },
        {
            id: 'College',
            label: 'College',
            description: 'Undergraduate degree or equivalent',
            icon: BookOpen
        },
        {
            id: 'Grad School',
            label: 'Grad School',
            description: "Master's or Doctoral degree",
            icon: Award
        },
        {
            id: 'Med School',
            label: 'Med School',
            description: 'Medical degree program',
            icon: Briefcase
        },
        {
            id: 'Other',
            label: 'Other',
            description: 'Alternative or non-traditional education',
            icon: MoreHorizontal
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-3">What is your education?</h1>
                    <p className="text-muted-foreground">Help us personalize your learning experience</p>
                </div>

                <div className="space-y-3 mb-8">
                    {educationLevels.map((level) => {
                        const Icon = level.icon;
                        const isSelected = selectedEducation === level.id;
                        
                        return (
                            <button
                                key={level.id}
                                onClick={() => onEducationSelect(level.id)}
                                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                                    isSelected
                                    ? 'border-blue-500 bg-card-selected'
                                    : 'border-ring bg-card-secondary hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        isSelected ? 'bg-foreground text-background' : 'bg-card text-foreground'
                                    }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="font-semibold text-foreground">{level.label}</div>
                                        <div className="text-sm text-muted-foreground">{level.description}</div>
                                    </div>
                                    
                                    {isSelected && (
                                        <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-background" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <SwitchButton
                    onPre={onBack}
                    onNext={onNext}
                    disablePre={!selectedEducation}
                />
            </div>
        </div>
    );
}
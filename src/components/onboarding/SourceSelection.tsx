import { Check } from 'lucide-react';
import SwitchButton from './SwitchButton';

export default function SourceSelection({
    selectedSource,
    onSourceSelect,
    onNext,
    onBack
}: {
    selectedSource: string;
    onSourceSelect: (source: string) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const sources = [
        'Social Media',
        'Search Engine',
        'Friend or Colleague',
        'Advertisement',
        'Blog or Article',
        'Other'
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-3">How did you hear about us?</h1>
                    <p className="text-muted-foreground">We'd love to know how you discovered our platform</p>
                </div>

                <div className="space-y-3 mb-8">
                    {sources.map((source) => (
                        <button
                            key={source}
                            onClick={() => onSourceSelect(source)}
                            className={`w-full p-5 rounded-xl border-2 transition-all text-left ${selectedSource === source
                                ? 'border-blue-500 bg-card-selected'
                                : 'border-ring bg-card-secondary hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground">{source}</span>
                                {selectedSource === source && (
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
                    disablePre={!selectedSource}
                />
            </div>
        </div>
    );
};
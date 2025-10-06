import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

export default function PremiumSelection({
    onSelectPremium,
    onSkip,
    onBack
}: {
    onSelectPremium: () => void;
    onSkip: () => void;
    onBack: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-3">Unlock Premium Features</h1>
                    <p className="text-muted-foreground">Enhance your learning experience with advanced tools</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card rounded-2xl border-2 border-ring p-8">
                        <h3 className="text-xl font-bold mb-4">Free</h3>
                        <div className="text-3xl font-bold mb-6">$0</div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-foreground">Create unlimited study sets</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-foreground">Basic study modes</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-foreground">Community access</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl border-2 border-transparent p-8 text-white relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                            POPULAR
                        </div>
                        <h3 className="text-xl font-bold mb-4">Premium</h3>
                        <div className="text-3xl font-bold mb-6">$9.99<span className="text-lg font-normal">/month</span></div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                                <span>Everything in Free</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                                <span>Advanced study modes</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                                <span>Ad-free experience</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                                <span>Priority support</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                                <span>Offline access</span>
                            </li>
                        </ul>
                        <button
                            onClick={onSelectPremium}
                            className="w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Start Premium Trial
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 rounded-xl border border-ring bg-card text-foreground hover:bg-card-secondary transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                    <button
                        onClick={onSkip}
                        className="px-4 py-2 rounded-xl bg-foreground text-background hover:bg-card-hovered transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <span>Skip for now</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
import { Check, Book, Layers } from 'lucide-react';
import SwitchButton from './SwitchButton';

export default function RoleSelection({
    selectedRole,
    onRoleSelect,
    onNext,
    onBack
}: {
    selectedRole: string;
    onRoleSelect: (role: string) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-3">I am a...</h1>
                    <p className="text-muted-foreground">Tell us about your role</p>
                </div>

                <div className="space-y-4 mb-8">
                    <button
                        onClick={() => onRoleSelect('student')}
                        className={`w-full p-6 rounded-xl border-2 transition-all ${selectedRole === 'student'
                            ? 'border-blue-500 bg-card-selected'
                            : 'border-ring bg-card-secondary hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Book className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-foreground text-lg">Student</div>
                                    <div className="text-sm text-muted-foreground">Learning and studying materials</div>
                                </div>
                            </div>
                            {selectedRole === 'student' && (
                                <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-background" />
                                </div>
                            )}
                        </div>
                    </button>

                    <button
                        onClick={() => onRoleSelect('teacher')}
                        className={`w-full p-6 rounded-xl border-2 transition-all ${selectedRole === 'teacher'
                            ? 'border-blue-500 bg-card-selected'
                            : 'border-ring bg-card-secondary hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-foreground text-lg">Teacher</div>
                                    <div className="text-sm text-muted-foreground">Creating and sharing study materials</div>
                                </div>
                            </div>
                            {selectedRole === 'teacher' && (
                                <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-background" />
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                <SwitchButton
                    onPre={onBack}
                    onNext={onNext}
                    disablePre={!selectedRole}
                />
            </div>
        </div>
    );
};
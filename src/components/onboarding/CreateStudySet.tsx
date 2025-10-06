import { ChevronRight, ChevronLeft, Book, Layers, Infinity } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CreateStudySetProps = {
    studySet: { name: string; description: string; privacy: string };
    onStudySetChange: (field: string, value: string) => void;
    onComplete: () => void;
    onSkip: () => void;
    onBack: () => void;
};

export default function CreateStudySet({
    studySet,
    onStudySetChange,
    onComplete,
    onSkip,
    onBack
}: CreateStudySetProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-3">Name Your First Study Set</h1>
                    <p className="text-muted-foreground">Create your personalized learning space to organize your study materials</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <Label className={"block text-sm font-semibold text-foreground mb-2"}>
                                Study Set Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="E.g., The name of your class"
                                value={studySet.name}
                                onChange={(e) => onStudySetChange('name', e.target.value)}
                                className="w-full px-4 py-3 bg-card"
                                maxLength={100}
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">{studySet.name.length}/100</div>
                        </div>

                        <div>
                            <Label className="block text-sm font-semibold text-foreground mb-2">
                                Description <span className="text-gray-500 font-normal">(Optional)</span>
                            </Label>
                            <Textarea
                                placeholder="Add a description to help you remember what this study set is about..."
                                value={studySet.description}
                                onChange={(e) => onStudySetChange('description', e.target.value)}
                                className="w-full px-4 py-3 bg-card"
                                rows={4}
                                maxLength={300}
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">{studySet.description.length}/300</div>
                        </div>

                        <div>
                            <Label className="block text-sm font-semibold text-foreground mb-2">Privacy</Label>
                            <Select
                                value={studySet.privacy}
                                onValueChange={(value) => onStudySetChange('privacy', value)}
                            >
                                <SelectTrigger className="w-full px-4 py-3 bg-card appearance-none cursor-pointer">
                                    <SelectValue placeholder="Select privacy level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">🌐 Public</SelectItem>
                                    <SelectItem value="private">🔒 Private</SelectItem>
                                    <SelectItem value="unlisted">👁️ Unlisted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <button
                            onClick={onComplete}
                            disabled={!studySet.name.trim()}
                            className="w-full py-4 bg-card-inverse text-background rounded-xl font-semibold hover:bg-card-hovered transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>+ Create Set</span>
                        </button>
                    </div>

                    <div className="bg-card-secondary rounded-2xl border-2 border-ring p-6">
                        <h3 className="text-xl font-bold text-foreground mb-6">What is a study set?</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Layers className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-foreground">Organize your materials into separate classes or semesters.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Book className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-foreground">Keep all of a class's materials in one place.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Infinity className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-foreground">You can make as many study sets as you want.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card-yellow rounded-xl p-4 border border-card-yellow-foreground">
                            <div className="flex items-start gap-2 mb-3">
                                <span className="text-lg">💡</span>
                                <h4 className="font-semibold text-foreground">Quick Tips</h4>
                            </div>
                            <ul className="space-y-2 text-sm text-foreground">
                                <li>💡 Use descriptive names like "CS101 - Data Structures"</li>
                                <li>💡 Add semester info: "Spring 2025 - React Development"</li>
                                <li>💡 Include your learning goal: "Mastering AI Fundamentals"</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-8">
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
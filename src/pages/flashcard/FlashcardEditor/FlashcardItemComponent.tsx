import { Image, Trash2, GripVertical } from 'lucide-react';
import type { FlashcardItemProps } from './type';

export default function FlashcardItemComponent({ card, index, onUpdate, onDelete, canDelete }: FlashcardItemProps) {
    return (
        <div className="flex items-start gap-4">
            {/* Number and Drag Handle */}
            <div className="flex flex-col items-center gap-2 pt-2">
                <span className="text-lg font-semibold text-muted-foreground">{index + 1}</span>
                <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 grid grid-cols-2 gap-4">
                {/* Term */}
                <div className="space-y-2">
                    <textarea
                        value={card.term}
                        onChange={(e) => onUpdate(card.id, 'term', e.target.value)}
                        placeholder="Term"
                        className="w-full px-4 py-3 bg-background border-b-2 border-border focus:border-foreground focus:outline-none resize-none min-h-[100px]"
                    />
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                        TERM
                    </label>
                    <button className="p-2 hover:bg-secondary rounded transition-colors">
                        <div className="w-full border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-foreground transition-colors cursor-pointer">
                            <Image className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold uppercase">Image</span>
                        </div>
                    </button>
                </div>

                {/* Definition */}
                <div className="space-y-2">
                    <textarea
                        value={card.definition}
                        onChange={(e) => onUpdate(card.id, 'definition', e.target.value)}
                        placeholder="Definition"
                        className="w-full px-4 py-3 bg-background border-b-2 border-border focus:border-foreground focus:outline-none resize-none min-h-[100px]"
                    />
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                        DEFINITION
                    </label>
                    <button className="p-2 hover:bg-secondary rounded transition-colors">
                        <div className="w-full border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-foreground transition-colors cursor-pointer">
                            <Image className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold uppercase">Image</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={() => onDelete(card.id)}
                disabled={!canDelete}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
}
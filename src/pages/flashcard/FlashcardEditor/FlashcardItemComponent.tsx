import { Image, Trash2, GripVertical, Loader2 } from 'lucide-react';
import type { FlashcardItemProps } from './type';
import { Button } from '@/components/ui/button';
import { useUploadImageFile } from '@/hooks/useImageUpload';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';

export default function FlashcardItemComponent({
    card,
    index,
    onUpdate,
    onDelete,
    canDelete
}: FlashcardItemProps) {
    console.log("🚀 ~ FlashcardItemComponent ~ card:", card)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadImageMutation = useUploadImageFile();
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        try {
            const result = await uploadImageMutation.mutateAsync(file);
            onUpdate(card.id, 'imageUrl', result.url);
            onUpdate(card.id, 'assetId', result.assetId);
            fileInputRef.current!.value = '';
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        }
    };

    const handleRemoveImage = () => {
        // onUpdate(card.id, 'imageUrl', '');
        onUpdate(card.id, 'assetId', undefined);
        fileInputRef.current!.value = '';
    };

    return (
        <div className="flex items-start gap-4 bg-card p-4 rounded-lg border border-border mb-4">
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
                        className="w-full rounded px-4 py-3 bg-background border-b-2 border-border focus:border-foreground focus:outline-none resize-none min-h-[100px]"
                    />
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                        TERM
                    </label>
                </div>

                {/* Definition */}
                <div className="space-y-2">
                    <textarea
                        value={card.definition}
                        onChange={(e) => onUpdate(card.id, 'definition', e.target.value)}
                        placeholder="Definition"
                        className="w-full rounded px-4 py-3 bg-background border-b-2 border-border focus:border-foreground focus:outline-none resize-none min-h-[100px]"
                    />
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                        DEFINITION
                    </label>
                </div>
            </div>

            {/* Image Upload & Delete */}
            <div className="flex items-center justify-center gap-2 mt-4">
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {card.imageUrl ? (
                    <div className="relative group">
                        <img
                            src={card.imageUrl}
                            alt="Card"
                            className="w-16 h-16 object-cover rounded border-2 border-border"
                        />
                        <button
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={handleImageClick}
                        disabled={uploadImageMutation.isPending}
                        className="h-16 rounded transition-colors cursor-pointer p-4 border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-foreground disabled:opacity-50"
                    >
                        {uploadImageMutation.isPending ? (
                            <>
                                <Loader2 className="w-6 h-6 mb-1 animate-spin" />
                                <span className="text-xs font-semibold uppercase">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Image className="w-6 h-6 mb-1" />
                                <span className="text-xs font-semibold uppercase">Image</span>
                            </>
                        )}
                    </Button>
                )}

                <Button
                    onClick={() => onDelete(card.id)}
                    disabled={!canDelete}
                    variant="ghost"
                    className="p-2 cursor-pointer text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
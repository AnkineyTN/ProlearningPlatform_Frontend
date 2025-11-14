import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    itemName?: string;
}

export default function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemName,
}: DeleteConfirmDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
                        </div>
                        <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base">
                        {description || `Are you sure you want to delete ${itemName}?`}
                        <br />
                        <span className="text-muted-foreground mt-2 block">
                            This action cannot be undone.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="px-4 py-2">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
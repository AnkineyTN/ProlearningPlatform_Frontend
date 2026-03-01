import { FileText, LoaderCircle, Sparkles, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeleteNoteDoc, useSummarizeFile } from "@/hooks/useNotes";

interface FilePreviewProps {
  fileId: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
  onFileSummarize: (summary: string, fileName: string) => void;
  onFileDeleted: () => void;
}

export const FilePreview = ({
  fileId,
  fileName,
  fileUrl,
  extension,
  publicId,
  onFileSummarize,
  onFileDeleted,
}: FilePreviewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const summarizeFileMutation = useSummarizeFile();
  const deleteNoteDocMutation = useDeleteNoteDoc();

  const handleSummarize = async () => {
    try {
      const response = await summarizeFileMutation.mutateAsync({
        noteDocsId: fileId,
        fileUrl,
        extension,
      });

      const summary = response.data.data.summary;
      onFileSummarize(summary, fileName);
      toast.success("File summarized successfully");
    } catch (error) {
      toast.error("Failed to summarize file");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNoteDocMutation.mutateAsync({
        noteDocsId: fileId,
        data: {
          publicId,
          extension,
        },
      });

      onFileDeleted();
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='w-full h-full overflow-auto flex flex-col'>
      <div className='p-4 border-b flex items-center justify-between sticky top-0'>
        <h3 className='font-semibold text-sm'>Uploaded File</h3>
        <Button
          size='sm'
          variant='ghost'
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <X className='w-4 h-4' />
        </Button>
      </div>

      <div className='flex-1 p-4'>
        <Card className='p-4 bg-white'>
          <div className='flex items-start gap-3 mb-4'>
            <FileText className='w-8 h-8 text-blue-500 flex-shrink-0 mt-1' />
            <div className='flex-1 min-w-0'>
              <p className='font-medium text-sm truncate'>{fileName}</p>
              <p className='text-xs text-gray-500'>{extension.toUpperCase()}</p>
            </div>
          </div>

          <Button
            onClick={handleSummarize}
            disabled={summarizeFileMutation.isPending}
            className='w-full gap-2'
            size='sm'
          >
            {summarizeFileMutation.isPending ? (
              <LoaderCircle className='w-4 h-4 animate-spin' />
            ) : (
              <Sparkles className='w-4 h-4' />
            )}
            Summarize File with AI
          </Button>

          {/* File Info */}
          <div className='mt-4 pt-4 border-t space-y-2'>
            <div>
              <p className='text-xs font-medium text-gray-600'>File Name</p>
              <p className='text-sm text-gray-900 break-all'>{fileName}</p>
            </div>
            <div>
              <p className='text-xs font-medium text-gray-600'>Format</p>
              <p className='text-sm text-gray-900'>{extension}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

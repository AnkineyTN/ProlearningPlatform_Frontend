import { Download, LoaderCircle, Save, Upload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadFile } from "@/hooks/useNotes";

interface NoteHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  isSaving: boolean;
  noteId: number;
  onFileUploaded: (file: {
    id: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    publicId: string;
  }) => void;
  onDownloadHTML: () => void;
}

export const NoteHeader = ({
  title,
  onTitleChange,
  onSave,
  isSaving,
  noteId,
  onFileUploaded,
  onDownloadHTML,
}: NoteHeaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const uploadFileMutation = useUploadFile();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await uploadFileMutation.mutateAsync({
        file,
        noteId,
      });
      console.log("🚀 ~ handleFileUpload ~ response:", response)

      const uploadedFile = response.data.data;
      console.log("🚀 ~ handleFileUpload ~ uploadedFile:", uploadedFile)
      onFileUploaded(uploadedFile);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const handleDownloadHTML = () => {
    onDownloadHTML();
  };

  return (
    <div className='flex items-center justify-between gap-4 border-b p-4 shadow-sm'>
      <div className='flex-1'>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder='Untitled Note'
          className='text-2xl font-bold border-none focus-visible:ring-0 p-0 h-auto'
        />
      </div>

      <div className='flex items-center gap-2'>
        <Button
          onClick={onSave}
          disabled={isSaving}
          size='sm'
          className='gap-2'
        >
          {isSaving ? (
            <LoaderCircle className='w-4 h-4 animate-spin' />
          ) : (
            <Save className='w-4 h-4' />
          )}
          Save
        </Button>

        <Button
          onClick={handleDownloadHTML}
          variant='outline'
          size='sm'
          className='gap-2'
        >
          <Download className='w-4 h-4' />
          Download
        </Button>

        <div className='relative'>
          <input
            type='file'
            onChange={handleFileUpload}
            disabled={isUploading}
            className='hidden'
            id='file-upload'
            accept='.pdf,.doc,.docx,.txt,.pptx'
          />
          <label htmlFor='file-upload'>
            <Button
              asChild
              variant='outline'
              size='sm'
              className='gap-2 cursor-pointer'
              disabled={isUploading}
            >
              <span>
                {isUploading ? (
                  <LoaderCircle className='w-4 h-4 animate-spin' />
                ) : (
                  <Upload className='w-4 h-4' />
                )}
                Upload
              </span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
};

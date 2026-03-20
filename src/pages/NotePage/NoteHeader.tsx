import { ArrowLeft, Download, LoaderCircle, Save, Upload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadDocumentFile } from "@/hooks/useImageUpload";
import { useNavigate } from "react-router-dom";

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
  onFileUploaded,
  onDownloadHTML,
}: NoteHeaderProps) => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const uploadFileMutation = useUploadDocumentFile();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.",
      );
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFileMutation.mutateAsync(file);

      // Create the uploaded file object with the result from Cloudinary
      const uploadedFile = {
        id: result.assetId,
        fileName: result.fileName,
        fileUrl: result.url,
        extension: result.extension,
        publicId: result.publicId,
      };

      console.log("🚀 ~ handleFileUpload ~ uploadedFile:", uploadedFile);
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
      <Button variant='outline' size='sm' className='gap-2' onClick={() => navigate(-1)}>
        <ArrowLeft className='w-4 h-4' />
        Back
      </Button>
      <div className='flex-1'>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder='Untitled Note'
          className='text-2xl font-bold border-none focus-visible:ring-0 px-4 py-2 h-auto w-100'
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

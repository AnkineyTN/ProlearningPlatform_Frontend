import {
  ArrowLeft,
  Download,
  FileText,
  LoaderCircle,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSaveDocumentInNote,
  useSaveImageInNote,
} from "@/hooks/useNotes";
import { isBrowserImageFile } from "@/lib/utils";
import {
  useUploadDocumentFile,
  useUploadImageFile,
} from "@/hooks/useImageUpload";
import { useNavigate, useParams } from "react-router-dom";

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
    kind: "doc" | "image";
  }) => void;
  onDownloadHTML: () => void;
  attachedFileCount?: number;
  showFilesPanel?: boolean;
  onToggleFilesPanel?: () => void;
  aiSummaryCount?: number;
  showAiPanel?: boolean;
  onToggleAiPanel?: () => void;
}

export const NoteHeader = ({
  title,
  onTitleChange,
  onSave,
  isSaving,
  noteId,
  onFileUploaded,
  onDownloadHTML,
  attachedFileCount = 0,
  showFilesPanel = true,
  onToggleFilesPanel,
  aiSummaryCount = 0,
  showAiPanel = true,
  onToggleAiPanel,
}: NoteHeaderProps) => {
  const navigate = useNavigate();
  const { setId: setIdParam } = useParams<{ setId: string }>();
  const setId = setIdParam ? Number(setIdParam) : 0;
  const [isUploading, setIsUploading] = useState(false);
  const uploadDocumentMutation = useUploadDocumentFile();
  const uploadImageMutation = useUploadImageFile();
  const saveDocumentMutation = useSaveDocumentInNote();
  const saveImageMutation = useSaveImageInNote();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validDocTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const isImage = isBrowserImageFile(file);
    if (!isImage && !validDocTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload images, PDF, DOC, DOCX, or TXT.",
      );
      return;
    }

    if (!setId || !noteId) {
      toast.error("Invalid note");
      return;
    }

    setIsUploading(true);
    try {
      if (isImage) {
        const result = await uploadImageMutation.mutateAsync(file);
        const ext = file.name.includes(".")
          ? file.name.split(".").pop() || ""
          : "";

        await saveImageMutation.mutateAsync({
          setId,
          data: {
            noteId,
            assetId: result.assetId,
            publicId: result.publicId,
            extension: ext,
            fileName: file.name,
          },
        });

        onFileUploaded({
          id: result.assetId,
          fileName: file.name,
          fileUrl: result.url,
          extension: ext,
          publicId: result.publicId,
          kind: "image",
        });
      } else {
        const result = await uploadDocumentMutation.mutateAsync(file);

        const ext =
          result.extension ||
          (file.name.includes(".") ? file.name.split(".").pop() || "" : "");

        await saveDocumentMutation.mutateAsync({
          setId,
          data: {
            noteId,
            assetId: result.assetId,
            publicId: result.publicId,
            extension: ext,
            fileName: result.fileName,
          },
        });

        onFileUploaded({
          id: result.assetId,
          fileName: result.fileName,
          fileUrl: result.url,
          extension: ext,
          publicId: result.publicId,
          kind: "doc",
        });
      }

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
            accept='.pdf,.doc,.docx,.txt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.avif'
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

        {attachedFileCount > 0 && onToggleFilesPanel ? (
          <Button
            type='button'
            variant={showFilesPanel ? "secondary" : "outline"}
            size='sm'
            className='gap-2'
            onClick={onToggleFilesPanel}
          >
            <FileText className='w-4 h-4' />
            Files ({attachedFileCount})
          </Button>
        ) : null}

        {aiSummaryCount > 0 && onToggleAiPanel ? (
          <Button
            type='button'
            variant={showAiPanel ? "secondary" : "outline"}
            size='sm'
            className='gap-2'
            onClick={onToggleAiPanel}
          >
            <Sparkles className='w-4 h-4' />
            AI ({aiSummaryCount})
          </Button>
        ) : null}
      </div>
    </div>
  );
};

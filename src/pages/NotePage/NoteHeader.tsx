import {
  ArrowLeft,
  Download,
  FileText,
  LoaderCircle,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSaveDocumentInNote,
  useSaveImageInNote,
} from "@/hooks/useNotes";
import { cn, isBrowserImageFile } from "@/lib/utils";
import {
  useUploadDocumentFile,
  useUploadImageFile,
} from "@/hooks/useImageUpload";
import { useNavigate, useParams } from "react-router-dom";
import { ShareDialog } from "@/components/collaboration/ShareDialog";
import type { CollabRole } from "@/services/types/collaboration.types";
import { useAppSelector } from "@/hooks/redux";

interface NoteHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  noteId: number;
  setId: number;
  userRole?: CollabRole;
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
  onlineUsers?: { name: string; color: string }[];
}

export const NoteHeader = ({
  title,
  onTitleChange,
  noteId,
  setId,
  userRole = "OWNER",
  onFileUploaded,
  onDownloadHTML,
  attachedFileCount = 0,
  showFilesPanel = true,
  onToggleFilesPanel,
  aiSummaryCount = 0,
  showAiPanel = true,
  onToggleAiPanel,
  onlineUsers = [],
}: NoteHeaderProps) => {
  const navigate = useNavigate();
  const { setId: setIdParam } = useParams<{ setId: string }>();
  const _setId = setId || (setIdParam ? Number(setIdParam) : 0);
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const [isUploading, setIsUploading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
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

    if (!_setId || !noteId) {
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
          setId: _setId,
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
          setId: _setId,
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
      event.target.value = "";
    }
  };

  const togglePillBase =
    "flex items-center gap-2 px-3 h-8 text-sm rounded-md border transition-colors cursor-pointer";
  const togglePillActive =
    "bg-[var(--pl-accent-soft)] border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)]";
  const togglePillInactive =
    "border-border text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)]";

  return (
    <>
      <div className='sticky top-0 z-20 bg-[var(--pl-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--pl-bg)]/80 border-b border-border'>
        <div className='flex items-center gap-3 px-6 py-3'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='flex items-center gap-1.5 text-sm text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] transition-colors cursor-pointer'
          >
            <ArrowLeft className='w-4 h-4' />
            Back
          </button>

          <span className='text-border select-none'>·</span>

          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder='Untitled Note'
            className='flex-1 min-w-0 max-w-2xl border-none bg-transparent shadow-none px-2 h-auto py-1 font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight focus-visible:ring-0'
            readOnly={userRole === "VIEWER"}
          />

          <div className='flex items-center gap-1.5 ml-auto'>
            {onlineUsers.length > 0 && (
              <div className='flex items-center gap-1.5 mr-1'>
                <div className='flex items-center -space-x-1.5'>
                  {onlineUsers.slice(0, 8).map((u, i) => (
                    <Avatar
                      key={i}
                      className='size-6 border-2 ring-2 ring-[var(--pl-bg)]'
                      style={{ borderColor: u.color }}
                    >
                      <AvatarFallback
                        className='text-[10px] font-medium'
                        style={{ backgroundColor: u.color, color: '#fff' }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {onlineUsers.length > 8 && (
                  <span className='text-xs text-[var(--pl-text-muted)] font-[family-name:var(--font-mono-pl)]'>
                    +{onlineUsers.length - 8}
                  </span>
                )}
              </div>
            )}

            <Button
              variant='ghost'
              size='sm'
              className='gap-2 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
              onClick={() => setShareOpen(true)}
            >
              <Share2 className='w-4 h-4' />
              Share
            </Button>

            {userRole !== "VIEWER" && (
              <>
                <Button
                  onClick={onDownloadHTML}
                  variant='ghost'
                  size='sm'
                  className='gap-2 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
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
                      variant='ghost'
                      size='sm'
                      className='gap-2 cursor-pointer text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
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

                <span className='mx-1 h-5 w-px bg-border' />

                {attachedFileCount > 0 && onToggleFilesPanel ? (
                  <button
                    type='button'
                    onClick={onToggleFilesPanel}
                    className={cn(
                      togglePillBase,
                      showFilesPanel ? togglePillActive : togglePillInactive,
                    )}
                  >
                    <FileText className='w-4 h-4' />
                    Files
                    <span className='font-[family-name:var(--font-mono-pl)] text-xs opacity-70'>
                      ({attachedFileCount})
                    </span>
                  </button>
                ) : null}

                {aiSummaryCount > 0 && onToggleAiPanel ? (
                  <button
                    type='button'
                    onClick={onToggleAiPanel}
                    className={cn(
                      togglePillBase,
                      showAiPanel ? togglePillActive : togglePillInactive,
                    )}
                  >
                    <Sparkles className='w-4 h-4' />
                    AI
                    <span className='font-[family-name:var(--font-mono-pl)] text-xs opacity-70'>
                      ({aiSummaryCount})
                    </span>
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        setId={_setId}
        resourceType='notes'
        resourceId={noteId}
        userRole={userRole}
        currentUserId={currentUserId}
      />
    </>
  );
};

import { ArrowLeft, FileText, Link2, Loader2, Upload, X, FileX } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import NoteCardSelect from "@/components/cards/NoteCardSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNotesBySet } from "@/hooks/useNotes";
import { mapI18nToAiApiLanguage } from "@/lib/utils";

type AISourceModalProps = {
  setId: number;
  currentPage: number;
  pageSize: number;
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: (data: {
    source: "notes" | "files" | "web";
    selectedItems: unknown[];
    language: string;
    freeText: string;
    urls?: string[];
  }) => void;
  isLoading?: boolean;
};

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }
}

const AISourceModal = ({
  setId,
  currentPage,
  pageSize,
  type,
  isOpen,
  onClose,
  onBack,
  onSubmit,
  isLoading,
}: AISourceModalProps) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<"notes" | "files" | "web">(
    "notes",
  );
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [webUrlsText, setWebUrlsText] = useState("");
  const [language, setLanguage] = useState(() =>
    mapI18nToAiApiLanguage(i18n.language),
  );
  const [freeText, setFreeText] = useState("");
  const { data: notesData } = useNotesBySet(setId, {
    page: currentPage,
    size: pageSize,
  });
  const notes = notesData?.items || [];

  const handleNoteSelect = (noteId: number) => {
    setSelectedNotes((prev) => {
      if (prev.includes(noteId)) {
        return prev.filter((id) => id !== noteId);
      } else {
        return [...prev, noteId];
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Limit to 3 files maximum
      if (filesArray.length > 3) {
        toast.error("Maximum 3 files allowed");
        setUploadedFiles(filesArray.slice(0, 3));
      } else {
        setUploadedFiles(filesArray);
      }
    }
  };

  const webUrls = webUrlsText
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSubmit = () => {
    const payload = {
      language,
      freeText: freeText.trim(),
    };
    if (activeTab === "notes" && selectedNotes.length > 0) {
      onSubmit({ source: "notes", selectedItems: selectedNotes, ...payload });
    } else if (activeTab === "files" && uploadedFiles.length > 0) {
      onSubmit({ source: "files", selectedItems: uploadedFiles, ...payload });
    } else if (activeTab === "web" && webUrls.length > 0) {
      onSubmit({
        source: "web",
        selectedItems: [],
        urls: webUrls,
        ...payload,
      });
    }
  };

  const canSubmit =
    (activeTab === "notes" && selectedNotes.length > 0) ||
    (activeTab === "files" && uploadedFiles.length > 0) ||
    (activeTab === "web" && webUrls.length > 0);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogContent
        className='w-full max-w-4xl sm:max-w-4xl px-10 py-8'
        showCloseButton={!isLoading}
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {t('modal.ai.header', { type: type.toLowerCase() })}
          </DialogTitle>
        </DialogHeader>

        <div className='max-h-[60vh] overflow-y-auto'>
          {/* Tabs */}
          <div className='flex gap-2 mb-2 border-b border-border'>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-2'>
                <FileText className='w-4 h-4' />
                {t('modal.ai.fromNotes')}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'files'
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-2'>
                <Upload className='w-4 h-4' />
                {t('modal.ai.uploadFiles')}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'web'
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-2'>
                <Link2 className='w-4 h-4' />
                {t('modal.ai.fromWeb', { defaultValue: 'Web URL' })}
              </div>
            </button>
          </div>

          {/* Content */}
          <div className='min-h-[250px] mb-2'>
            {activeTab === 'notes' && (
              <div>
                {notes.length === 0 ? (
                  <div className='flex flex-col justify-center items-center py-12 gap-2'>
                    <FileX className='text-muted-foreground mx-auto mb-1 text-6xl w-12 h-12' />
                    <div className='text-muted-foreground text-lg'>
                      No notes found
                    </div>
                  </div>
                ) : (
                  <>
                    <p className='text-sm text-muted-foreground mb-4'>
                      {t('modal.ai.selectNotes', { type: type.toLowerCase() })}
                    </p>
                    <div className='space-y-2'>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
                        {notes.map((note) => (
                          <NoteCardSelect
                            key={note.id}
                            note={{
                              id: note.id,
                              title: note.title,
                              description:
                                note.description ||
                                'No description available...',
                              privacy: note.privacy,
                              timeAgo: getTimeAgo(note.updated_at),
                              created_at: new Date(
                                note.created_at,
                              ).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }),
                            }}
                            onSelected={() => {
                              if (!isLoading) handleNoteSelect(note.id);
                            }}
                            isSelected={selectedNotes.includes(note.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {selectedNotes.length > 0 && (
                  <p className='text-sm text-muted-foreground mt-3'>
                    {selectedNotes.length} note
                    {selectedNotes.length > 1 ? 's' : ''}{' '}
                    {t('modal.ai.selected')}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className='flex flex-col items-center justify-center'>
                <div className='mt-2 w-full border-2 border-dashed border-ring rounded-lg p-8 text-center hover:border-foreground transition-colors'>
                  <Upload className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
                  <h3 className='font-medium mb-2'>
                    {t('modal.ai.uploadFiles')}
                  </h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    PDF, DOCX, TXT (Maximum 3 files)
                  </p>
                  <label className='inline-block'>
                    <input
                      type='file'
                      multiple
                      onChange={(e) => {
                        if (!isLoading) handleFileUpload(e);
                      }}
                      className='hidden'
                      accept='.pdf,.docx,.txt,.doc'
                      disabled={isLoading}
                    />
                    <span
                      className={`px-4 py-2 bg-foreground text-background rounded-lg inline-block ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:opacity-90 transition-opacity'
                      }`}
                    >
                      {t('modal.ai.chooseFiles')}
                    </span>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className='w-full mt-4'>
                    <p className='text-sm font-medium mb-2'>
                      {t('modal.ai.uploadedFiles')}:
                    </p>
                    <div className='space-y-2'>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-2 transition-[background] duration-300 bg-[var(--pl-bg-sunken)] rounded border border-border'
                        >
                          <span className='text-sm truncate'>{file.name}</span>
                          <button
                            onClick={() =>
                              setUploadedFiles((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                            className='text-muted-foreground hover:text-foreground cursor-pointer'
                          >
                            <X className='w-4 h-4' />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'web' && (
              <div className='w-full'>
                <p className='text-sm text-muted-foreground mb-2'>
                  {t('modal.ai.webUrlsHint', {
                    defaultValue: 'Enter one URL per line (https://…)',
                  })}
                </p>
                <Textarea
                  value={webUrlsText}
                  onChange={(e) => setWebUrlsText(e.target.value)}
                  placeholder='https://example.com/article'
                  disabled={isLoading}
                  rows={6}
                  className='resize-y min-h-[120px] font-mono text-sm'
                />
                {webUrls.length > 0 && (
                  <p className='text-sm text-muted-foreground mt-2'>
                    {webUrls.length} URL{webUrls.length !== 1 ? 's' : ''}{' '}
                    {t('modal.ai.selected')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className='mb-2'>
            <Label className='text-sm font-medium mb-2 block'>
              {t('modal.ai.language', { defaultValue: 'Language' })}
            </Label>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as 'English' | 'Vietnamese')}
              disabled={isLoading}
            >
              <SelectTrigger className='w-full max-w-md'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='English'>English</SelectItem>
                <SelectItem value='Vietnamese'>Vietnamese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='mb-6'>
            <Label className='text-sm font-medium mb-2 block'>
              {t('modal.ai.specialRequirements', {
                defaultValue: 'Special requirements (optional)',
              })}
            </Label>
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder={t('modal.ai.specialRequirementsPlaceholder', {
                defaultValue:
                  'E.g. focus on definitions, avoid obscure facts, align with chapter 3…',
              })}
              disabled={isLoading}
              rows={4}
              className='resize-y min-h-[100px]'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onBack} disabled={isLoading} variant={'ghost'}>
            <ArrowLeft className='w-4 h-4' />
            {t('modal.back')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            variant={'default'}
          >
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
                <span>{t('modal.ai.generating') || 'Generating...'}</span>
              </>
            ) : (
              <>{t('modal.generateWithAI')}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AISourceModal;

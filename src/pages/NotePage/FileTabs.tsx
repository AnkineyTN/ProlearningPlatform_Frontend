import React from "react";
import { FileIcon, X } from "lucide-react";

interface UploadedFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
}

type Props = {
  files: UploadedFile[];
  selectedFileId: number | null;
  showSidebar: boolean;
  onSelectFile: (fileId: number) => void;
  onRemoveFile: (fileId: number) => void;
};

const FileTabs = ({
  files,
  selectedFileId,
  showSidebar,
  onSelectFile,
  onRemoveFile,
}) => {
  if (files.length === 0) return null;

  return (
    <div className='bg-muted border-b border-border overflow-x-auto whitespace-nowrap px-6 py-2 shadow-sm sticky top-[61px] z-40'>
      <div className='flex gap-2 min-w-max'>
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer 
                            ${
                              selectedFileId === file.id && showSidebar
                                ? "bg-purple-600 text-white"
                                : "bg-card text-foreground hover:bg-card-secondary"
                            }`}
          >
            <FileIcon className='w-4 h-4' />
            <span className='truncate max-w-[150px]'>{file.fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile(file.id);
              }}
              className={`p-0.5 rounded-full cursor-pointer ${
                selectedFileId === file.id && showSidebar
                  ? "text-white/80 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <X className='w-3 h-3' />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileTabs;

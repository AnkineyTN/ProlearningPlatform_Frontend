import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { mapI18nToAiApiLanguage } from "@/lib/utils";

interface UploadedFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
  content: string;
}

export const useFileManagement = ({
  noteId,
  editor,
  uploadFileMutation,
  summarizeFileMutation,
  convertToVectorDBMutation,
  deleteNoteDocMutation,
}: any) => {
  const { i18n } = useTranslation();
  const [uploadedFilesList, setUploadedFilesList] = useState<UploadedFile[]>(
    [],
  );
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [showFileSidebar, setShowFileSidebar] = useState<boolean>(false);
  const [fileSummary, setFileSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const selectedFile = useMemo(() => {
    return uploadedFilesList.find((f) => f.id === selectedFileId);
  }, [uploadedFilesList, selectedFileId]);

  const handleFileUpload = async (file: File) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      alert(
        "Invalid file type. Please upload an image, PDF, DOC, or TXT file.",
      );
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadFileMutation.mutateAsync({ file, noteId });
      const uploadedData: UploadedFile = response.data.data;

      setUploadedFilesList((prev) => [...prev, uploadedData]);

      if (!file.type.startsWith("image/")) {
        await convertToVectorDBMutation.mutateAsync({
          noteDocsId: uploadedData.id,
          fileName: uploadedData.fileName,
          fileUrl: uploadedData.fileUrl,
          extension: uploadedData.extension,
          noteId,
        });
      }

      if (file.type.startsWith("image/")) {
        const blocks = editor.document;
        editor.insertBlocks(
          [
            {
              type: "image",
              props: {
                url: uploadedData.fileUrl,
                caption: uploadedData.fileName,
              },
            },
          ],
          blocks[blocks.length - 1],
          "after",
        );
      } else {
        setSelectedFileId(uploadedData.id);
        setShowFileSidebar(true);
        setFileSummary("");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSummarizeFile = async () => {
    if (!selectedFile) return;

    setIsSummarizing(true);
    try {
      const response = await summarizeFileMutation.mutateAsync({
        language: mapI18nToAiApiLanguage(i18n.language),
        limit: 0,
        file_url: selectedFile.fileUrl,
      });
      setFileSummary(response.data.data.summary);
    } catch (error) {
      console.error("Summarize failed:", error);
      setFileSummary("Failed to summarize. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const generateSummaryBlocks = (summaryText: string): any[] => {
    const parts = summaryText.split("\n\n");
    const blocks: any[] = [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `✨ AI Summary of ${selectedFile?.fileName || "Document"}:`,
            styles: { bold: true, textColor: "purple" },
          },
        ],
      },
    ];

    function parseNode(node: ChildNode): any[] {
      if (node.nodeType === Node.TEXT_NODE) {
        return [{ type: "text", text: node.textContent || "" }];
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === "B" || el.tagName === "STRONG") {
          return [
            {
              type: "text",
              text: el.textContent || "",
              styles: { bold: true },
            },
          ];
        }
        if (el.tagName === "I" || el.tagName === "EM") {
          return [
            {
              type: "text",
              text: el.textContent || "",
              styles: { italic: true },
            },
          ];
        }
        let children: any[] = [];
        el.childNodes.forEach((child) => {
          children = children.concat(parseNode(child));
        });
        return children;
      }
      return [];
    }

    for (const part of parts) {
      const doc = new DOMParser().parseFromString(part, "text/html");
      doc.body.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName === "P") {
            blocks.push({ type: "paragraph", content: parseNode(el) });
          } else if (el.tagName === "H1") {
            blocks.push({
              type: "heading",
              props: { level: 1 },
              content: parseNode(el),
            });
          } else if (el.tagName === "H2") {
            blocks.push({
              type: "heading",
              props: { level: 2 },
              content: parseNode(el),
            });
          } else {
            blocks.push({ type: "paragraph", content: parseNode(el) });
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            blocks.push({
              type: "paragraph",
              content: [{ type: "text", text }],
            });
          }
        }
      });
    }
    return blocks;
  };

  const handleApplySummary = () => {
    if (!fileSummary || !selectedFile) return;

    const summaryBlocks = generateSummaryBlocks(fileSummary);
    const blocks = editor.document;
    editor.insertBlocks(summaryBlocks, blocks[blocks.length - 1], "after");
  };

  const handleRemoveFile = async (fileId: number) => {
    const fileToRemove = uploadedFilesList.find((f) => f.id === fileId);
    if (!fileToRemove) return;

    try {
      await deleteNoteDocMutation.mutateAsync({
        noteId,
        assetId: fileId,
        publicId: fileToRemove.publicId,
        extension: fileToRemove.extension,
      });

      setUploadedFilesList((prev) => prev.filter((f) => f.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
        setShowFileSidebar(false);
        setFileSummary("");
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete file. Please try again.");
    }
  };

  return {
    uploadedFilesList,
    setUploadedFilesList,
    selectedFileId,
    setSelectedFileId,
    showFileSidebar,
    setShowFileSidebar,
    fileSummary,
    setFileSummary,
    isSummarizing,
    selectedFile,
    handleFileUpload,
    handleSummarizeFile,
    handleApplySummary,
    handleRemoveFile,
    isUploading,
    setIsUploading,
  };
};

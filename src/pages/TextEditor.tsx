import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Save, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

// Types
interface EditorProps {
    initialTitle?: string;
    onSave?: (title: string, content: any) => void;
}

const NotionEditor: React.FC<EditorProps> = ({
    initialTitle = 'OOP Interview Question',
    onSave
}) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState<string>(initialTitle);
    const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

    // Initialize BlockNote editor
    const editor = useCreateBlockNote({
        initialContent: [
            {
                type: "heading",
                content: "Heading 1...",
                props: {
                    level: 1
                }
            },
            {
                type: "paragraph",
                content: ""
            }
        ]
    });

    const handleBack = () => {
        navigate(-1);
    };

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false);
        }
    };

    const handleSave = () => {
        const blocks = editor.document;
        if (onSave) {
            onSave(title, blocks);
        } else {
            console.log('Saving document:', { title, blocks });
            alert('Document saved!');
        }
    };

    const handleDownload = async () => {
        // Lấy document (các block)
        const blocks = editor.document;
        console.log("🚀 ~ handleDownload ~ blocks:", blocks);
        const html = await editor.blocksToHTMLLossy(blocks);
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            </head>
            <body>
            ${html}
            </body>
            </html>
            `;
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };


    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <FileText onClick={handleBack} className="w-6 h-6 text-gray-700" />
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleBlur}
                                onKeyDown={handleTitleKeyDown}
                                onFocus={(e) => e.target.select()}
                                className="text-lg font-medium bg-transparent border-none outline-none focus:ring-0 px-2 py-1"
                                autoFocus
                            />
                        ) : (
                            <h1
                                onClick={handleTitleClick}
                                className="text-lg font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                            >
                                {title}
                            </h1>
                        )}
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleDownload}
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                        <Button
                            size="sm"
                            className="gap-2 bg-black text-white hover:bg-gray-800"
                            onClick={handleSave}
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </Button>
                    </div>
                </div>
            </header>

            {/* Editor Content */}
            <main className="max-w-4xl mx-auto px-8 py-12">
                <BlockNoteView
                    editor={editor}
                    theme="light"
                />
            </main>
        </div>
    );
};

export default NotionEditor;
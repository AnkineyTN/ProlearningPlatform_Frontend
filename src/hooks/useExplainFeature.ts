import { useState, useEffect } from 'react';

interface ExplainPopupState {
    show: boolean;
    selectedText: string;
    answer: string;
    loading: boolean;
    position: { top: number; left: number };
}

export const useExplainFeature = ({ noteId, editor, explainMutation }: any) => {
    const [explainPopup, setExplainPopup] = useState<ExplainPopupState>({
        show: false,
        selectedText: '',
        answer: '',
        loading: false,
        position: { top: 0, left: 0 }
    });

    // Handle text selection
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            const selectedText = selection?.toString().trim();

            if (selectedText && selectedText.length > 0) {
                const range = selection?.getRangeAt(0);
                const rect = range?.getBoundingClientRect();

                if (rect) {
                    setExplainPopup({
                        show: true,
                        selectedText,
                        answer: '',
                        loading: false,
                        position: {
                            top: rect.top - 50,
                            left: rect.left + rect.width / 2
                        }
                    });
                }
            } else {
                // if (!explainPopup.loading && !explainPopup.answer) {
                //     setExplainPopup(prev => ({ ...prev, show: false }));
                // }
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, [explainPopup.loading, explainPopup.answer]);

    const handleExplainClick = async () => {
        if (!explainPopup.selectedText) return;

        setExplainPopup(prev => ({ ...prev, loading: true }));

        try {
            const response = await explainMutation.mutateAsync({
                noteId,
                queryText: explainPopup.selectedText
            });

            setExplainPopup(prev => ({
                ...prev,
                answer: response.data.data.answer,
                loading: false
            }));
        } catch (error) {
            console.error('Explain failed:', error);
            setExplainPopup(prev => ({
                ...prev,
                loading: false,
                answer: 'Failed to explain. Please try again.'
            }));
        }
    };

    const generateSummaryBlocks = (summaryText: string): any[] => {
        const parts = summaryText.split('\n\n');
        const blocks: any[] = [];

        function parseNode(node: ChildNode): any[] {
            if (node.nodeType === Node.TEXT_NODE) {
                return [{ type: "text", text: node.textContent || "" }];
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                if (el.tagName === "B" || el.tagName === "STRONG") {
                    return [{ type: "text", text: el.textContent || "", styles: { bold: true } }];
                }
                if (el.tagName === "I" || el.tagName === "EM") {
                    return [{ type: "text", text: el.textContent || "", styles: { italic: true } }];
                }
                let children: any[] = [];
                el.childNodes.forEach(child => {
                    children = children.concat(parseNode(child));
                });
                return children;
            }
            return [];
        }

        for (const part of parts) {
            const doc = new DOMParser().parseFromString(part, "text/html");
            doc.body.childNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node as HTMLElement;
                    if (el.tagName === "P") {
                        blocks.push({ type: "paragraph", content: parseNode(el) });
                    } else if (el.tagName === "H1") {
                        blocks.push({ type: "heading", props: { level: 1 }, content: parseNode(el) });
                    } else if (el.tagName === "H2") {
                        blocks.push({ type: "heading", props: { level: 2 }, content: parseNode(el) });
                    } else {
                        blocks.push({ type: "paragraph", content: parseNode(el) });
                    }
                } else if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent?.trim();
                    if (text) {
                        blocks.push({ type: "paragraph", content: [{ type: "text", text }] });
                    }
                }
            });
        }
        return blocks;
    };

    const generateExplanationBlocks = (answerText: string): any[] => {
        const blocks = [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "✨ AI Explanation:",
                        styles: { bold: true, textColor: "blue" }
                    }
                ]
            },
            ...generateSummaryBlocks(answerText)
        ];
        return blocks;
    };

    const handleApplyExplanation = () => {
        try {
            console.log("=== START APPLY EXPLANATION ===");
            console.log("Applying explanation to editor...");

            const blocks = editor.document;

            let anchorBlock = blocks[blocks.length - 1];

            if (explainPopup.selectedText) {
                const found = blocks.find(
                    (block: any) =>
                        block.content &&
                        Array.isArray(block.content) &&
                        block.content.some(
                            (c: any) =>
                                c.text && c.text.includes(explainPopup.selectedText)
                        )
                );
                if (found) anchorBlock = found;
            }

            const explanationBlocks = generateExplanationBlocks(explainPopup.answer);

            editor.insertBlocks(
                explanationBlocks,
                anchorBlock,
                "after"
            );

            console.log("=== INSERT SUCCESS ===");

            // Đợi một chút trước khi đóng popup
            setTimeout(() => {
                handleCancelExplanation();
            }, 100);

        } catch (error) {
            console.error("❌ Error in handleApplyExplanation:", error);
        }
    };

    const handleCancelExplanation = () => {
        setExplainPopup({
            show: false,
            selectedText: '',
            answer: '',
            loading: false,
            position: { top: 0, left: 0 }
        });
        window.getSelection()?.removeAllRanges();
    };

    return {
        explainPopup,
        handleExplainClick,
        handleApplyExplanation,
        handleCancelExplanation
    };
};
import React from "react";
import { Sparkles, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  show: boolean;
  selectedText: string;
  answer: string;
  loading: boolean;
  position: { top: number; left: number };
  onExplain: () => void;
  onApply: () => void;
  onCancel: () => void;
};

const ExplainPopup: React.FC<ExplainPopupProps> = ({
  show,
  selectedText,
  answer,
  loading,
  position,
  onExplain,
  onApply,
  onCancel,
}) => {
  if (!show) return null;
  if (!answer) {
    return (
      <div
        className='absolute z-50'
        style={{
          top: `${position.top + 150}px`,
          left: `${position.left + 450}px`,
          transform: "translateX(-50%)",
        }}
      >
        <Button
          size='sm'
          className='gap-2 shadow-lg bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
          onClick={onExplain}
          disabled={loading}
        >
          <Sparkles className='w-4 h-4' />
          {loading ? "Explaining..." : "Explain with AI"}
        </Button>
      </div>
    );
  }

  // Popup hiển thị kết quả explanation
  return (
    <div
      className='fixed z-50 bg-card border border-border rounded-lg shadow-2xl p-4 max-w-md scrollbar max-h-96 overflow-y-auto min-w-[320px]'
      style={{
        top: `${position.top - 50}px`,
        left: `${position.left + 540}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className='flex items-start justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <Sparkles className='w-4 h-4 text-purple-600' />
          <h3 className='font-semibold text-sm'>AI Explanation</h3>
        </div>
        <button
          onClick={onCancel}
          className='text-muted-foreground cursor-pointer hover:text-foreground'
        >
          <X className='w-4 h-4' />
        </button>
      </div>

      <div className='mb-3 p-2 bg-muted rounded text-sm'>
        <p className='text-muted-foreground font-medium mb-1'>Selected text:</p>
        <p className='italic'>"{selectedText}"</p>
      </div>

      <div
        className='mb-4 text-sm'
        dangerouslySetInnerHTML={{ __html: answer }}
      />

      <div className='flex gap-2 justify-end'>
        <Button
          variant='outline'
          size='sm'
          onClick={onCancel}
          className='cursor-pointer'
        >
          Cancel
        </Button>
        <Button
          size='sm'
          className='gap-2 text-white bg-purple-600 hover:bg-purple-700 cursor-pointer'
          style={{ pointerEvents: "auto", position: "relative", zIndex: 9999 }}
          onMouseDown={(e) => {
            console.log("🖱️ Apply button MOUSE DOWN - executing onApply");
            e.preventDefault();
            e.stopPropagation();
            onApply();
          }}
        >
          <Check className='w-4 h-4' />
          Apply to Note
        </Button>
      </div>
    </div>
  );
};

export default ExplainPopup;

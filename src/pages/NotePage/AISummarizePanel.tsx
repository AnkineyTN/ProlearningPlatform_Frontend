import { Copy, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AISummary {
  id: string;
  query: string;
  response: string;
  type: "text" | "file"; // text for text explanation, file for file summary
}

interface AISummarizePanelProps {
  summaries: AISummary[];
  onRemoveSummary: (id: string) => void;
}

export const AISummarizePanel = ({
  summaries,
  onRemoveSummary,
}: AISummarizePanelProps) => {
  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (summaries.length === 0) {
    return (
      <div className='w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6'>
        <Sparkles className='w-12 h-12 text-blue-300 mb-4' />
        <p className='text-center text-gray-600 font-medium'>
          AI Summarize Panel
        </p>
        <p className='text-center text-sm text-gray-500 mt-2'>
          Highlight text to summarize or upload a file to get AI insights
        </p>
      </div>
    );
  }

  return (
    <div className='w-full h-full overflow-auto flex flex-col'>
      <div className='p-4 border-b sticky top-0 flex items-center gap-2'>
        <Sparkles className='w-5 h-5 text-blue-500' />
        <h3 className='font-semibold text-sm'>AI Insights</h3>
      </div>

      <div className='flex-1 overflow-auto p-4 space-y-4'>
        {summaries.map((summary) => (
          <Card
            key={summary.id}
            className='p-4 bg-card hover:shadow-md transition-shadow'
          >
            {/* Query Section */}
            <div className='mb-4'>
              <div className='flex items-start justify-between mb-2'>
                <p className='text-xs font-medium text-foreground/70'>
                  {summary.type === "file"
                    ? "Content Summary"
                    : "Your Question"}
                </p>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-6 w-6 p-0'
                  onClick={() => onRemoveSummary(summary.id)}
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>
              <p className='text-sm text-foreground bg-card-selected p-3 rounded-lg leading-relaxed italic border-l-2 border-blue-400'>
                "{summary.query}"
              </p>
            </div>

            {/* Response Section */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-xs font-medium text-foreground/70'>
                  AI Response
                </p>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-6 w-6 p-0 opacity-60 hover:opacity-100'
                  onClick={() => handleCopyResponse(summary.response)}
                >
                  <Copy className='w-4 h-4' />
                </Button>
              </div>
              <div
                className='text-sm text-foreground p-3 bg-stat-card-3 rounded-lg leading-relaxed border-l-2 border-green-400 prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{ __html: summary.response }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

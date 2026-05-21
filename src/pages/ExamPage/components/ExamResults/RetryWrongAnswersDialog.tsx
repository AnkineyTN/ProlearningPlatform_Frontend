import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useExamQuestionStats,
  useGenerateReviewExam,
} from '@/hooks/useReviewBundles';

interface RetryWrongAnswersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setId: number;
  examId: number;
}

export default function RetryWrongAnswersDialog({
  open,
  onOpenChange,
  setId,
  examId,
}: RetryWrongAnswersDialogProps) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const { data: questionStatsData, isLoading: statsLoading } =
    useExamQuestionStats(setId, examId);
  const generateReviewExam = useGenerateReviewExam();

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (next) {
      setSelectedIds(new Set());
      setDone(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await generateReviewExam.mutateAsync({
        setId,
        examId,
        body: { questionIds: Array.from(selectedIds) },
      });
      setDone(true);
      toast.success(
        'Đã tạo Exam ôn tập! Kiểm tra trong tab Review của Set.',
      );
      setTimeout(() => {
        onOpenChange(false);
        navigate(`/sets/${setId}/review`);
      }, 1500);
    } catch {
      toast.error('Tạo Exam thất bại. Vui lòng thử lại.');
    }
  };

  const stats = questionStatsData?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl max-h-[85vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <RotateCcw className='w-5 h-5 text-orange-500' />
            Luyện lại câu sai
          </DialogTitle>
        </DialogHeader>

        <div className='mt-2 min-h-0 flex-1 overflow-y-auto space-y-3'>
          {statsLoading && (
            <div className='flex items-center justify-center gap-2 py-8 text-muted-foreground'>
              <Loader2 className='w-5 h-5 animate-spin' />
              <span className='text-sm'>Đang tải thống kê...</span>
            </div>
          )}

          {!statsLoading && stats.length === 0 && (
            <div className='flex flex-col items-center gap-2 py-8 text-muted-foreground text-center'>
              <AlertCircle className='w-8 h-8' />
              <p className='text-sm'>Chưa có dữ liệu thống kê câu sai.</p>
              <p className='text-xs'>
                Câu essay đang chờ chấm sẽ không hiển thị ở đây.
              </p>
            </div>
          )}

          {!statsLoading && stats.length > 0 && (
            <>
              <p className='text-sm text-muted-foreground'>
                Chọn các câu bạn muốn ôn lại. AI sẽ tạo bài kiểm tra mới với câu
                hỏi biến thể trên cùng chủ đề.
              </p>

              <div className='flex items-center gap-2 pb-1 border-b border-border'>
                <input
                  type='checkbox'
                  id='select-all-retry'
                  className='cursor-pointer'
                  checked={selectedIds.size === stats.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(stats.map((q) => q.questionId)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                />
                <label
                  htmlFor='select-all-retry'
                  className='text-sm font-medium cursor-pointer'
                >
                  Chọn tất cả ({stats.length} câu)
                </label>
              </div>

              <ul className='space-y-2'>
                {stats.map((stat) => {
                  const pct = Math.round(stat.incorrectRate * 100);
                  const checked = selectedIds.has(stat.questionId);
                  return (
                    <li
                      key={stat.questionId}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        checked
                          ? 'border-orange-400/60 bg-orange-50/40 dark:bg-orange-950/20'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                      onClick={() => {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(stat.questionId)) {
                            next.delete(stat.questionId);
                          } else {
                            next.add(stat.questionId);
                          }
                          return next;
                        });
                      }}
                    >
                      <input
                        type='checkbox'
                        checked={checked}
                        onChange={() => {}}
                        className='mt-0.5 cursor-pointer shrink-0'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium line-clamp-2'>
                          {stat.questionText}
                        </p>
                        <div className='flex items-center gap-3 mt-1.5'>
                          <div className='flex items-center gap-1.5 flex-1'>
                            <div className='h-1.5 flex-1 rounded-full bg-muted overflow-hidden'>
                              <div
                                className='h-full rounded-full bg-red-500 transition-all'
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                pct >= 60
                                  ? 'text-red-500'
                                  : pct >= 30
                                    ? 'text-orange-500'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {pct}% sai
                            </span>
                          </div>
                          <span className='text-xs text-muted-foreground shrink-0'>
                            {stat.incorrectCount}/{stat.totalAttempts} lần
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className='flex items-center justify-between pt-3 border-t border-border mt-2'>
          <span className='text-sm text-muted-foreground'>
            {selectedIds.size} câu được chọn
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              size='sm'
              disabled={
                selectedIds.size === 0 || generateReviewExam.isPending || done
              }
              className='gap-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 cursor-pointer disabled:opacity-60'
              onClick={handleSubmit}
            >
              {generateReviewExam.isPending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : done ? (
                <CheckCircle className='w-4 h-4' />
              ) : (
                <RotateCcw className='w-4 h-4' />
              )}
              {done ? 'Đã tạo!' : 'Tạo bài ôn tập'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

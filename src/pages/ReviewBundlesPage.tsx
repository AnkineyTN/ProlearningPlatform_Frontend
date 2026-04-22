import { useNavigate } from 'react-router-dom';
import { Inbox, CalendarRange, BookOpen, Loader2 } from 'lucide-react';
import { useReviewBundles } from '@/hooks/useReviewBundles';

function formatPeriod(from: string, to: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

export default function ReviewBundlesPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useReviewBundles();

  const bundles = data?.data ?? [];

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500'>
            <Inbox className='w-6 h-6 text-white' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Review Bundles</h1>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Tổng hợp các thẻ trả lời sai trong tuần — cần ôn lại
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className='flex justify-center items-center min-h-[300px]'>
            <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className='text-center py-16 text-destructive'>
            Không tải được danh sách bundle. Vui lòng thử lại.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && bundles.length === 0 && (
          <div className='flex flex-col items-center justify-center min-h-[300px] text-center gap-3'>
            <Inbox className='w-16 h-16 text-muted-foreground/50' />
            <p className='text-muted-foreground'>
              Không có bundle nào cần ôn lại.
            </p>
            <p className='text-sm text-muted-foreground/70'>
              Hệ thống sẽ tự động tạo bundle khi bạn trả lời sai các thẻ trong
              tuần.
            </p>
          </div>
        )}

        {/* Bundle list */}
        {!isLoading && !isError && bundles.length > 0 && (
          <div className='grid gap-4'>
            {bundles.map((bundle) => (
              <button
                key={bundle.id}
                onClick={() => navigate(`/review-bundles/${bundle.id}`)}
                className='w-full text-left bg-[var(--pl-bg)] border border-border rounded-xl p-5 hover:border-purple-500/50 hover:bg-card/80 transition-all cursor-pointer group'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors'>
                      <BookOpen className='w-5 h-5 text-purple-500' />
                    </div>
                    <div>
                      <p className='font-semibold text-foreground'>
                        Bundle #{bundle.id}
                      </p>
                      <div className='flex items-center gap-1 mt-1 text-sm text-muted-foreground'>
                        <CalendarRange className='w-3.5 h-3.5' />
                        <span>
                          {formatPeriod(bundle.periodFrom, bundle.periodTo)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex-shrink-0 text-right'>
                    <span className='inline-flex items-center gap-1.5 bg-pink-500/10 text-pink-500 font-semibold text-sm px-3 py-1 rounded-full'>
                      {bundle.cardCount} thẻ sai
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

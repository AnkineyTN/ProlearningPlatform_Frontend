import { Bell, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  useSetNotificationPreferences,
  useUpdateSetNotificationPreferences,
} from '@/hooks/useNotifications';

type Props = {
  open: boolean;
  setId: number;
  setTitle?: string;
  onOpenChange: (open: boolean) => void;
};

// ISO weekday: 1=Mon … 7=Sun (per spec section 3.2.2).
const DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'Thứ Hai' },
  { value: 2, label: 'Thứ Ba' },
  { value: 3, label: 'Thứ Tư' },
  { value: 4, label: 'Thứ Năm' },
  { value: 5, label: 'Thứ Sáu' },
  { value: 6, label: 'Thứ Bảy' },
  { value: 7, label: 'Chủ Nhật' },
];

export default function SetNotificationSettingsDialog({
  open,
  setId,
  setTitle,
  onOpenChange,
}: Props) {
  const { data, isLoading } = useSetNotificationPreferences(setId, open);
  const updateMutation = useUpdateSetNotificationPreferences(setId);

  // Defaults if missing: weeklySummaryEnabled = false, weeklySummaryDay = 1 (Mon).
  const weeklySummaryEnabled = data?.weeklySummaryEnabled ?? false;
  const weeklySummaryDay = data?.weeklySummaryDay ?? 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Bell className='w-4 h-4' />
            Cài đặt thông báo Set
          </DialogTitle>
          {setTitle && (
            <DialogDescription className='truncate'>
              {setTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className='py-10 flex justify-center'>
            <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div className='rounded-xl border border-border bg-[var(--pl-bg-elev)]'>
            <div className='px-4 pt-3 pb-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>
              Nhắc nhở ôn tập
            </div>

            {/* Row 1: Enable reminder */}
            <div className='flex items-start justify-between gap-4 px-4 py-3 border-t border-border'>
              <div className='min-w-0'>
                <div className='text-sm font-medium'>Bật nhắc nhở</div>
                <div className='text-xs text-muted-foreground mt-0.5'>
                  Nhận thông báo ôn tập định kỳ cho Set này.
                </div>
              </div>
              <Switch
                checked={weeklySummaryEnabled}
                disabled={updateMutation.isPending}
                onCheckedChange={(v) =>
                  updateMutation.mutate({ weeklySummaryEnabled: v })
                }
                className='cursor-pointer mt-0.5'
              />
            </div>

            {/* Row 2: Day-of-week — disabled when reminder is off */}
            <div
              className={cn(
                'flex items-start justify-between gap-4 px-4 py-3 border-t border-border transition-opacity',
                !weeklySummaryEnabled && 'opacity-50 pointer-events-none',
              )}
            >
              <div className='min-w-0 flex-1'>
                <div className='text-sm font-medium'>Ngày phát thông báo</div>
                <div className='text-xs text-muted-foreground mt-0.5'>
                  Chọn ngày trong tuần để nhận nhắc nhở.
                </div>
              </div>
              <Select
                value={String(weeklySummaryDay)}
                onValueChange={(v) =>
                  updateMutation.mutate({ weeklySummaryDay: Number(v) })
                }
                disabled={!weeklySummaryEnabled || updateMutation.isPending}
              >
                <SelectTrigger className='w-[140px] cursor-pointer'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

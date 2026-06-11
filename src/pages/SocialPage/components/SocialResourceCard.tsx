import { FileText, FilePen, SwatchBook, HelpCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/utils';
import type { SocialItemType } from '@/services/types/social.types';
import { UserAvatar } from './RailSidebar';

const TYPE_ICON: Record<SocialItemType, React.ElementType> = {
  NOTE: FileText,
  FLASHCARD: SwatchBook,
  EXAM: FilePen,
};

export type SocialCardItem = {
  id: number;
  type: SocialItemType;
  title: string;
  description: string;
  createdAt: string;
  ownerName: string;
  ownerAvatar?: string | null;
  numQuestions?: number | null;
  duration?: number | null;
};

type Props = {
  item: SocialCardItem;
  onAccess: () => void;
};

const SocialResourceCard = ({ item, onAccess }: Props) => {
  console.log('🚀 ~ SocialResourceCard ~ item:', item);
  const { t } = useTranslation();
  const Icon = TYPE_ICON[item.type];
  const description = item.description || t('list.noDescription');
  const numQuestions = item.numQuestions ?? 0;
  const minutes = item.duration ? Math.floor(item.duration / 60) : 30;

  return (
    <div
      onClick={onAccess}
      className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] hover:border-[var(--pl-accent-border)] rounded-[14px] p-[18px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_oklch(0_0_0/0.08)] flex flex-col'
    >
      {/* Icon */}
      <div className='w-9 h-9 rounded-[9px] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] grid place-items-center shrink-0 mb-[14px]'>
        <Icon size={16} />
      </div>

      {/* Title */}
      <div
        style={{ fontFamily: 'var(--font-display)' }}
        className='text-[15px] font-semibold text-[var(--pl-text)] tracking-[-0.01em] mb-1 overflow-hidden text-ellipsis whitespace-nowrap'
      >
        {item.title}
      </div>

      {/* Description */}
      <div className='text-[12.5px] text-[var(--pl-text-muted)] flex-1 overflow-hidden line-clamp-2 leading-[1.5] mb-[14px]'>
        {description}
      </div>

      {/* Stats pills (exam) */}
      {item.type === 'EXAM' && (
        <div className='flex gap-2 mb-[14px]'>
          <span className='flex items-center gap-[5px] text-[11px] font-semibold px-[10px] py-1 rounded-full bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] tabular-nums'>
            <HelpCircle size={11} />
            {t('card.exam.questions', { count: numQuestions })}
          </span>
          <span className='flex items-center gap-[5px] text-[11px] font-semibold px-[10px] py-1 rounded-full bg-[var(--pl-bg-hover)] text-[var(--pl-text-muted)]'>
            <Clock size={11} />
            {t('card.exam.minutes', { count: minutes })}
          </span>
        </div>
      )}

      {/* Footer: owner + date */}
      <div className='flex items-center justify-between gap-2 pt-3 border-t border-t-[var(--pl-border)] mt-auto'>
        <div className='flex items-center gap-2 min-w-0'>
          <UserAvatar name={item.ownerName} src={item.ownerAvatar} size={22} />
          <span className='text-[11.5px] text-[var(--pl-text-muted)] truncate'>
            {item.ownerName}
          </span>
        </div>
        <span className='text-[11px] text-[var(--pl-text-faint)] tabular-nums shrink-0'>
          {formatDate(item.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default SocialResourceCard;

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ModeToggle from '@/components/theme/mode-toggle';
import LanguageToggle from '@/components/language/language-toggle';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useTranslation } from 'react-i18next';

type Props = {
  onSearch?: (query: string) => void;
};

const HeaderSet = ({ onSearch }: Props) => {
  const { t } = useTranslation();
  return (
    <div className='flex justify-between items-center mb-8'>
      <h1 className={`text-4xl font-bold`}>{t('setlist.title')}</h1>
      <div className='flex items-center gap-4'>
        {/* Search Bar */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
          <Input
            type='text'
            placeholder='Search...'
            onChange={(e) => onSearch?.(e.target.value)}
            className='bg-[var(--pl-bg)] pl-10 pr-4 py-2 w-80 rounded-full border border-muted-foreground'
          />
        </div>

        <div className='flex items-center gap-3 shrink-0'>
          <NotificationBell />
          <ModeToggle />
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
};

export default HeaderSet;

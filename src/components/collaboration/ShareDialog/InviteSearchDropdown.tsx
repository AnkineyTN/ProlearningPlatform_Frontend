import { forwardRef } from 'react';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserSearchResult } from '@/services/types/collaboration.types';

interface InviteSearchDropdownProps {
  keyword: string;
  debouncedKeyword: string;
  isSearching: boolean;
  showDropdown: boolean;
  filteredResults: UserSearchResult[];
  showEmailFallback: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onKeywordChange: (value: string) => void;
  onShowDropdown: (show: boolean) => void;
  onSelectUser: (user: UserSearchResult) => void;
  onAddByEmail: () => void;
}

const itemCls =
  'h-auto w-full justify-start gap-2 rounded-none px-3 py-2 text-left text-sm font-normal hover:bg-[var(--pl-bg)]';

const InviteSearchDropdown = forwardRef<
  HTMLInputElement,
  InviteSearchDropdownProps
>(function InviteSearchDropdown(
  {
    keyword,
    debouncedKeyword,
    isSearching,
    showDropdown,
    filteredResults,
    showEmailFallback,
    dropdownRef,
    onKeywordChange,
    onShowDropdown,
    onSelectUser,
    onAddByEmail,
  },
  ref,
) {
  return (
    <div className='relative'>
      <Search className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        ref={ref}
        placeholder='Search by name or email…'
        className='pl-8'
        value={keyword}
        onChange={(e) => {
          onKeywordChange(e.target.value);
          onShowDropdown(true);
        }}
        onFocus={() => onShowDropdown(true)}
      />
      {isSearching && (
        <Loader2 className='absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground' />
      )}

      {showDropdown && debouncedKeyword.trim().length >= 2 && (
        <div
          ref={dropdownRef}
          className='absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-[var(--pl-bg-hover)] py-1 shadow-md'
        >
          {filteredResults.map((u) => (
            <Button
              key={u.id}
              type='button'
              variant='ghost'
              onClick={() => onSelectUser(u)}
              className={itemCls}
            >
              <Avatar className='size-7'>
                {u.avatarUrl && (
                  <AvatarImage src={u.avatarUrl} alt={u.firstName} />
                )}
                <AvatarFallback className='text-xs'>
                  {u.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='truncate font-medium'>
                  {u.firstName} {u.lastName}
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  {u.email}
                </p>
              </div>
            </Button>
          ))}

          {showEmailFallback && (
            <Button
              type='button'
              variant='ghost'
              onClick={onAddByEmail}
              className={itemCls}
            >
              <UserPlus className='size-4 shrink-0 text-muted-foreground' />
              <span>
                Invite <strong>{keyword.trim()}</strong> by email
              </span>
            </Button>
          )}

          {!isSearching &&
            filteredResults.length === 0 &&
            !showEmailFallback && (
              <p className='px-3 py-2 text-sm text-muted-foreground'>
                No users found
              </p>
            )}
        </div>
      )}
    </div>
  );
});

export default InviteSearchDropdown;

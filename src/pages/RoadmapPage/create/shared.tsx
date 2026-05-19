import { Button } from '@/components/ui/button';

export const tempKey = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className='block text-[11px] uppercase tracking-[0.14em] mb-2 text-[var(--pl-text-faint)]'>
      {label}
    </label>
    {children}
  </div>
);

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className='inline-flex rounded-[10px] p-1 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Button
            key={String(opt.value)}
            type='button'
            variant='ghost'
            onClick={() => onChange(opt.value)}
            className={`px-4 py-[6px] rounded-[7px] text-[12.5px] h-auto transition-all ${
              active
                ? 'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] font-medium hover:bg-[var(--pl-accent-strong)] hover:text-[var(--pl-accent-fg)]'
                : 'bg-transparent text-[var(--pl-text-muted)] font-normal'
            }`}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

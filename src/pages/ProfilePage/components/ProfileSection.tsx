import { Label } from '@/components/ui/label';

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className='text-[11.5px] tracking-[0.06em] uppercase font-normal text-[var(--pl-text-faint)]'>
      {children}
    </Label>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <span className='text-[11.5px] italic font-[var(--font-serif)] text-[var(--pl-text-faint)]'>
      {children}
    </span>
  );
}

interface ProfileSectionProps {
  title: string;
  sub?: string;
  children: React.ReactNode;
}

export default function ProfileSection({
  title,
  sub,
  children,
}: ProfileSectionProps) {
  return (
    <section className='rounded-[16px] mb-5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] p-7'>
      <div className='mb-5'>
        <h3
          className='text-[22px] font-medium tracking-tight m-0 mb-1 text-[var(--pl-text)]'
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h3>
        {sub && (
          <p className='text-[13px] m-0 italic font-[var(--font-serif)] text-[var(--pl-text-muted)]'>
            {sub}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

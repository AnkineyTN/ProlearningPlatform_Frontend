export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] overflow-hidden'>
      {children}
    </section>
  );
}

export function PanelHead({
  kicker,
  title,
  right,
}: {
  kicker?: string;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className='px-6 pt-[18px] pb-[14px] flex items-end justify-between gap-3'>
      <div>
        {kicker && (
          <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)] mb-1'>
            {kicker}
          </div>
        )}
        {title && (
          <div className='text-[18px] font-semibold tracking-[-0.015em] text-[var(--pl-text)]'>
            {title}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

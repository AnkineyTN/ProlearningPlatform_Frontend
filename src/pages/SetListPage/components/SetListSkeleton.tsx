type Props = {
  count?: number;
  viewMode: 'grid' | 'table';
};

export default function SetListSkeleton({ count = 6, viewMode }: Props) {
  if (viewMode === 'table') {
    return (
      <div
        className='rounded-lg overflow-hidden border'
        style={{ borderColor: 'var(--pl-border)' }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className='flex items-center gap-4 px-4 py-3 animate-pulse'
            style={{
              borderBottom:
                i === count - 1 ? 'none' : '1px solid var(--pl-border)',
              background: 'var(--pl-bg-elev)',
            }}
          >
            <div className='size-8 rounded bg-[var(--pl-border)] opacity-60' />
            <div className='flex-1 space-y-2'>
              <div className='h-3 w-1/3 rounded bg-[var(--pl-border)] opacity-60' />
              <div className='h-2.5 w-1/2 rounded bg-[var(--pl-border)] opacity-40' />
            </div>
            <div className='h-2.5 w-16 rounded bg-[var(--pl-border)] opacity-40' />
            <div className='h-2.5 w-20 rounded bg-[var(--pl-border)] opacity-40' />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-8'>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='rounded-[14px] border animate-pulse p-5'
          style={{
            borderColor: 'var(--pl-border)',
            background: 'var(--pl-bg-elev)',
            minHeight: 220,
          }}
        >
          <div className='flex justify-between items-start mb-[14px]'>
            <div className='size-8 rounded bg-[var(--pl-border)] opacity-60' />
            <div className='h-4 w-4 rounded bg-[var(--pl-border)] opacity-40' />
          </div>
          <div className='h-4 w-3/5 rounded bg-[var(--pl-border)] opacity-60 mb-2' />
          <div className='h-3 w-4/5 rounded bg-[var(--pl-border)] opacity-40 mb-1.5' />
          <div className='h-3 w-2/3 rounded bg-[var(--pl-border)] opacity-40 mb-5' />
          <div className='h-2 w-full rounded bg-[var(--pl-border)] opacity-40 mb-4' />
          <div className='flex justify-between pt-3'>
            <div className='flex gap-3'>
              <div className='h-2.5 w-8 rounded bg-[var(--pl-border)] opacity-40' />
              <div className='h-2.5 w-8 rounded bg-[var(--pl-border)] opacity-40' />
              <div className='h-2.5 w-8 rounded bg-[var(--pl-border)] opacity-40' />
            </div>
            <div className='h-2.5 w-12 rounded bg-[var(--pl-border)] opacity-40' />
          </div>
        </div>
      ))}
    </div>
  );
}

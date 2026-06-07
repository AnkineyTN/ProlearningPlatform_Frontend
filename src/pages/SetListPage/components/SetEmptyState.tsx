import { FolderX } from 'lucide-react';

type Props = {
  onCreateClick: () => void;
};

export default function SetEmptyState({ onCreateClick }: Props) {
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <FolderX
        size={56}
        style={{ color: 'var(--pl-border-strong)' }}
        className='mb-5'
      />
      <h3
        className='text-[18px] font-[500] mb-2'
        style={{ color: 'var(--pl-text)' }}
      >
        No sets yet
      </h3>
      <p className='text-[13px] mb-6' style={{ color: 'var(--pl-text-muted)' }}>
        Create your first study set to get started
      </p>
      <button
        onClick={onCreateClick}
        className='px-5 py-[10px] rounded-full text-[13px] font-[500]'
        style={{
          background: 'var(--pl-accent)',
          color: 'var(--pl-accent-fg)',
        }}
      >
        Create your first set
      </button>
    </div>
  );
}

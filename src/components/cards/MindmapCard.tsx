import { Network, MoreVertical, Clock } from 'lucide-react';

export type Mindmap = {
  title: string;
  category: string;
  preview: string;
  time: string;
  date: string;
};

const MindmapCard = ({
  mindmap,
  onAccess,
}: {
  mindmap: Mindmap;
  onAccess: (id: string) => void;
}) => {
  const handleClick = () => {
    onAccess(mindmap.title); // Giả sử 'title' là ID của mindmap
  };
  return (
    <div
      className='bg-[var(--pl-bg)] rounded-xl p-5 shadow-sm cursor-pointer'
      onClick={handleClick}
    >
      <div className='flex justify-between items-start mb-3'>
        <Network className='w-5 h-5' />
        <button
          className='hover:bg-card-secondary p-1 rounded cursor-pointer'
          title='More options'
        >
          <MoreVertical className='w-4 h-4' />
        </button>
      </div>
      <h2 className='font-semibold mb-1'>{mindmap.title}</h2>
      <p className='text-xs text-muted-foreground mb-3'>{mindmap.category}</p>
      <p className='text-sm text-muted-foreground mb-4'>{mindmap.preview}</p>
      <div className='flex justify-between items-center text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <Clock className='w-3 h-3' /> {mindmap.time}
        </span>
        <span>{mindmap.date}</span>
      </div>
    </div>
  );
};

export default MindmapCard;

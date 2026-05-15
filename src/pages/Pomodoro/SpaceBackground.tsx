import type { SpaceDto } from '@/services/types/pomodoro.types';

interface Props {
  space: SpaceDto | null;
}

const SpaceBackground = ({ space }: Props) => {
  if (!space) return null;

  if (space.assetType === 'VIDEO') {
    return (
      <video
        key={space.id}
        className='absolute inset-0 z-0 w-full h-full object-cover'
        src={space.assetUrl}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <div
      key={space.id}
      className='absolute inset-0 z-0 w-full h-full'
      style={{
        backgroundImage: `url("${space.assetUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default SpaceBackground;

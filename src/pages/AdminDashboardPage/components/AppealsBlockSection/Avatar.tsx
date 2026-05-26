type Props = { name: string; size?: number };

const Avatar = ({ name, size = 30 }: Props) => {
  const initials = name
    .split(' ')
    .slice(-2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const hue = ((name.charCodeAt(0) || 65) * 13 + name.length * 27) % 360;
  return (
    <div
      className='rounded-lg shrink-0 grid place-items-center font-medium font-[family-name:var(--font-mono-pl)]'
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `oklch(0.6 0.12 ${hue} / 0.18)`,
        border: `1px solid oklch(0.6 0.12 ${hue} / 0.4)`,
        color: `oklch(0.7 0.13 ${hue})`,
      }}
    >
      {initials || 'U'}
    </div>
  );
};

export default Avatar;

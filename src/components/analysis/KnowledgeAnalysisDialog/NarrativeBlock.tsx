interface NarrativeBlockProps {
  icon: React.ReactNode;
  label: string;
  text: string;
}

export default function NarrativeBlock({
  icon,
  label,
  text,
}: NarrativeBlockProps) {
  if (!text?.trim()) return null;
  return (
    <section>
      <div className='flex items-center gap-2 mb-1.5'>
        {icon}
        <h3 className='text-sm font-semibold'>{label}</h3>
      </div>
      <p className='text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed'>
        {text}
      </p>
    </section>
  );
}

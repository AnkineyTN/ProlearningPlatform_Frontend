type Props = { label: string; value: string; mono?: boolean };

const Field = ({ label, value, mono }: Props) => (
  <div>
    <div className='text-[10.5px] tracking-[0.12em] uppercase text-muted-foreground mb-1'>
      {label}
    </div>
    <div
      className={`text-[13.5px] ${mono ? 'font-[family-name:var(--font-mono-pl)]' : ''}`}
    >
      {value}
    </div>
  </div>
);

export default Field;

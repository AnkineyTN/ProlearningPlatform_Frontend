import type { ReactNode } from 'react';

type Props = { children: ReactNode; className?: string };

const Panel = ({ children, className = '' }: Props) => (
  <section
    className={`bg-[var(--pl-bg-elev)] border border-border rounded-[14px] overflow-hidden ${className}`}
  >
    {children}
  </section>
);

export default Panel;

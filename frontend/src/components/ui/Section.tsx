import { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionProps { id?: string; narrow?: boolean; className?: string; children: ReactNode }
export function Section({ id, narrow, className, children }: SectionProps) {
  return (
    <section id={id} className={clsx('py-20', className)}>
      <div className={clsx('px-6 mx-auto', narrow ? 'max-w-4xl' : 'max-w-6xl')}>
        {children}
      </div>
    </section>
  );
}

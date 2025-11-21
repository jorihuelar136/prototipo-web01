import { ReactNode } from 'react';
import clsx from 'clsx';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition p-6', className)}>{children}</div>;
}

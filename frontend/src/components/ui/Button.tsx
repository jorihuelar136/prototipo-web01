import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const sizeClasses = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2', lg: 'px-7 py-3 text-lg' };

export function Button({ variant='primary', size='md', className, children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants: Record<string,string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-500',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500'
  };
  return (
    <button className={clsx(base, variants[variant], sizeClasses[size], className)} {...rest}>
      {children}
    </button>
  );
}

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' | 'neutral';
  pill?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  pill = false,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold select-none';
  
  const variants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    outline: 'border border-light-border text-slate-600 bg-transparent',
    neutral: 'bg-slate-100 text-slate-800',
  };

  const pillClass = pill ? 'rounded-full' : 'rounded';

  return (
    <span
      className={twMerge(clsx(baseStyles, pillClass, variants[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
};

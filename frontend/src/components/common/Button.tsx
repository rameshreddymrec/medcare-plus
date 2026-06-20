import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 focus:ring-primary',
      secondary: 'bg-secondary text-white hover:opacity-90 shadow-md shadow-secondary/20 focus:ring-secondary',
      accent: 'bg-accent text-white hover:opacity-90 shadow-md shadow-accent/20 focus:ring-accent',
      success: 'bg-success text-white hover:opacity-90 shadow-md shadow-success/20 focus:ring-success',
      warning: 'bg-warning text-white hover:opacity-90 shadow-md shadow-warning/20 focus:ring-warning',
      danger: 'bg-danger text-white hover:opacity-90 shadow-md shadow-danger/20 focus:ring-danger',
      outline: 'border border-light-border bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-primary',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-primary',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3 text-base',
      icon: 'h-10 w-10 p-0',
    };

    const variantClass = variants[variant];
    const sizeClass = sizes[size];

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
        className={twMerge(clsx(baseStyles, variantClass, sizeClass, className))}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="mr-2 inline-flex">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? (
          <span className="ml-2 inline-flex">{rightIcon}</span>
        ) : null}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

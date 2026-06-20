import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
  animate?: boolean;
  delay?: number;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = false, hoverEffect = false, animate = false, delay = 0, children, ...props }, ref) => {
    
    const cardClass = twMerge(
      clsx(
        'rounded-xl border border-light-border bg-white text-slate-900 shadow-sm transition-all duration-300',
        glass && 'glass-premium border-white/30',
        hoverEffect && 'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20',
        className
      )
    );

    if (animate) {
      return (
        <motion.div
          ref={ref as any}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay }}
          whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : undefined}
          className={cardClass}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClass} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={twMerge('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={twMerge('text-sm text-slate-500', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge('flex items-center p-6 pt-0 border-t border-slate-100 mt-4', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

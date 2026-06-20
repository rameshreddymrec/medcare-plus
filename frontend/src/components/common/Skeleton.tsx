import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  width,
  height,
  style,
  ...props
}) => {
  const styles: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse bg-slate-200',
          variant === 'line' && 'h-4 rounded-md w-full',
          variant === 'circle' && 'rounded-full',
          variant === 'rect' && 'rounded-lg',
          className
        )
      )}
      style={styles}
      {...props}
    />
  );
};

export const SkeletonTextList: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={twMerge('flex flex-col space-y-2 w-full', className)}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="line"
          className={clsx(
            idx === lines - 1 && 'w-4/5',
            idx === 0 && 'w-full',
            idx > 0 && idx < lines - 1 && 'w-11/12'
          )}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-xl border border-light-border p-6 bg-white space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circle" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="line" className="w-1/3" />
          <Skeleton variant="line" className="w-1/4" />
        </div>
      </div>
      <SkeletonTextList lines={3} />
    </div>
  );
};

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        ok: 'bg-[var(--ok-bg)] text-[var(--ok)]',
        warn: 'bg-[var(--warn-bg)] text-[var(--warn)]',
        danger: 'bg-[var(--danger-bg)] text-[var(--danger)]',
        blue: 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]',
        purple: 'bg-[var(--primary-bg)] text-[var(--primary)]',
        gray: 'bg-[var(--gray-light)] text-[var(--text-sub)]',
      },
    },
    defaultVariants: {
      variant: 'gray',
    },
  },
);

const dotColors: Record<string, string> = {
  ok: 'bg-[var(--ok)]',
  warn: 'bg-[var(--warn)]',
  danger: 'bg-[var(--danger)]',
  blue: 'bg-[var(--badge-blue-text)]',
  purple: 'bg-[var(--primary)]',
  gray: 'bg-[var(--text-sub)]',
};

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'gray', dot, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))}>
      {dot && (
        <span
          className={cn('w-[5px] h-[5px] rounded-full flex-shrink-0', dotColors[variant || 'gray'])}
        />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };

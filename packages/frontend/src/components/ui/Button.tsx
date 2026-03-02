import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-[5px] rounded-[5px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary)] text-white border border-[var(--primary)] hover:bg-[var(--primary-dark)] hover:border-[var(--primary-dark)] active:opacity-90',
        outline:
          'bg-white text-[var(--text)] border border-[var(--gray-border)] hover:bg-[var(--gray-light)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
        danger:
          'bg-[var(--danger)] text-white border border-[var(--danger)] hover:opacity-90 active:opacity-80',
        ghost:
          'bg-transparent text-[var(--text-sub)] border border-transparent hover:bg-[var(--gray-light)] hover:text-[var(--text)]',
        'ghost-danger':
          'bg-transparent text-[var(--danger)] border border-transparent hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]',
      },
      size: {
        default: 'h-[30px] px-3 text-[12.5px]',
        sm: 'h-[26px] px-2 text-[11px]',
        small: 'h-[26px] px-2 text-[11px]',
        lg: 'h-[36px] px-4 text-[13px]',
        icon: 'h-[30px] w-[30px] p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  asChild?: boolean;
}

export default function Button({
  variant,
  size,
  icon,
  asChild = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </Comp>
  );
}

export { buttonVariants };

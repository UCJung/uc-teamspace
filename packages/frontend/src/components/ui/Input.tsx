import React from 'react';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[34px] w-full rounded-md border border-[var(--gray-border)] bg-white px-3 py-1.5 text-[13px] text-[var(--text)]',
          'placeholder:text-[var(--text-sub)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-150',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export default Input;

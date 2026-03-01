import React from 'react';

type Variant = 'primary' | 'outline' | 'danger';
type Size = 'default' | 'small';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--primary)] text-white border border-[var(--primary)] hover:bg-[var(--primary-dark)] hover:border-[var(--primary-dark)]',
  outline: 'bg-white text-[var(--text)] border border-[var(--gray-border)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
  danger: 'bg-[var(--danger)] text-white border border-[var(--danger)] hover:opacity-90',
};

const sizeStyles: Record<Size, string> = {
  default: 'h-[30px] px-3 text-[12px]',
  small: 'h-[26px] px-2 text-[11px]',
};

export default function Button({
  variant = 'primary',
  size = 'default',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        'inline-flex items-center gap-1.5 rounded font-medium transition-colors cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

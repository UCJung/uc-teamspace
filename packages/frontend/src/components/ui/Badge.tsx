import React from 'react';

type BadgeVariant = 'ok' | 'warn' | 'danger' | 'blue' | 'purple' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  ok: { bg: 'bg-[var(--ok-bg)]', text: 'text-[var(--ok)]', dot: 'bg-[var(--ok)]' },
  warn: { bg: 'bg-[var(--warn-bg)]', text: 'text-[var(--warn)]', dot: 'bg-[var(--warn)]' },
  danger: { bg: 'bg-[var(--danger-bg)]', text: 'text-[var(--danger)]', dot: 'bg-[var(--danger)]' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-600' },
  purple: { bg: 'bg-[var(--primary-bg)]', text: 'text-[var(--primary)]', dot: 'bg-[var(--primary)]' },
  gray: { bg: 'bg-gray-100', text: 'text-[var(--text-sub)]', dot: 'bg-[var(--text-sub)]' },
};

export default function Badge({ variant = 'gray', dot, children, className = '' }: BadgeProps) {
  const styles = variantStyles[variant];
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium',
        styles.bg,
        styles.text,
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={['w-1.5 h-1.5 rounded-full flex-shrink-0', styles.dot].join(' ')} />
      )}
      {children}
    </span>
  );
}

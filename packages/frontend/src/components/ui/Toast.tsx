import React from 'react';
import { useUiStore } from '../../stores/uiStore';

type ToastType = 'success' | 'warning' | 'info' | 'danger';

const toastStyles: Record<ToastType, { border: string; icon: string; iconColor: string }> = {
  success: { border: 'border-l-[var(--ok)]', icon: '✓', iconColor: 'text-[var(--ok)]' },
  warning: { border: 'border-l-[var(--warn)]', icon: '!', iconColor: 'text-[var(--warn)]' },
  info: { border: 'border-l-[var(--primary)]', icon: 'i', iconColor: 'text-[var(--primary)]' },
  danger: { border: 'border-l-[var(--danger)]', icon: '✕', iconColor: 'text-[var(--danger)]' },
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
}

function ToastItem({ id, type, message }: ToastItemProps) {
  const { removeToast } = useUiStore();
  const styles = toastStyles[type];

  return (
    <div
      className={[
        'flex items-start gap-3 bg-white shadow-lg rounded border-l-4 px-4 py-3 min-w-[260px] max-w-[340px]',
        styles.border,
      ].join(' ')}
    >
      <span className={['font-bold text-[13px] flex-shrink-0', styles.iconColor].join(' ')}>
        {styles.icon}
      </span>
      <p className="flex-1 text-[12px] text-[var(--text)]">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="text-[var(--text-sub)] hover:text-[var(--text)] text-[16px] leading-none ml-1"
      >
        &times;
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-[60px] right-5 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}

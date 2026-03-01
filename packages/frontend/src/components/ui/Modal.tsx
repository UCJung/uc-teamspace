import React, { useEffect } from 'react';
import Button from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'default' | 'confirm';
}

export default function Modal({ open, onClose, title, children, footer, size = 'default' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const width = size === 'confirm' ? 'w-[360px]' : 'w-[480px]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`${width} bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--gray-border)]">
            <h2 className="text-[14px] font-semibold text-[var(--text)]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[var(--text-sub)] hover:text-[var(--text)] text-[18px] leading-none"
            >
              &times;
            </button>
          </div>
        )}
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--gray-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="confirm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-[13px] text-[var(--text)]">{message}</p>
    </Modal>
  );
}

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
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
  const width = size === 'confirm' ? 'w-[360px]' : 'w-[480px]';

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'bg-white flex flex-col max-h-[90vh] rounded-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden',
            'animate-modalIn',
            width,
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-[var(--gray-border)] px-5 py-4">
              <DialogPrimitive.Title className="text-[14px] font-bold text-[var(--text)]">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                className="text-[var(--text-sub)] hover:text-[var(--text)] text-[18px] leading-none cursor-pointer"
              >
                &times;
              </DialogPrimitive.Close>
            </div>
          )}
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {children}
          </div>
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-[var(--gray-border)] px-5 py-3.5">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
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

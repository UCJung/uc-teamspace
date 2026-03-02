import React, { useState } from 'react';
import { toast } from 'sonner';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Label from './Label';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  /** 최초 로그인 강제 변경 모드일 때 true — 닫기 버튼 비활성화 */
  forced?: boolean;
}

export default function ChangePasswordModal({ open, onClose, forced = false }: ChangePasswordModalProps) {
  const { clearMustChangePassword } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    if (forced) return; // 강제 변경 모드에서는 닫기 불가
    reset();
    onClose();
  };

  const validate = (): string | null => {
    if (!currentPassword) return '현재 비밀번호를 입력하세요.';
    if (newPassword.length < 8) return '새 비밀번호는 최소 8자 이상이어야 합니다.';
    if (newPassword !== confirmPassword) return '새 비밀번호가 일치하지 않습니다.';
    if (currentPassword === newPassword) return '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      clearMustChangePassword();
      toast.success('비밀번호가 변경되었습니다.');
      reset();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해 주세요.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="비밀번호 변경"
      footer={
        <>
          {!forced && (
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              취소
            </Button>
          )}
          <Button
            variant="primary"
            type="submit"
            form="change-password-form"
            disabled={loading}
          >
            {loading ? '변경 중...' : '변경하기'}
          </Button>
        </>
      }
    >
      {forced && (
        <div
          className="mb-4 rounded-md px-4 py-3 text-[13px]"
          style={{
            backgroundColor: 'var(--warn-bg)',
            color: 'var(--warn)',
            border: '1px solid var(--warn-bg)',
          }}
        >
          최초 로그인 시 비밀번호를 변경해야 합니다. 변경 후 서비스를 이용할 수 있습니다.
        </div>
      )}

      <form id="change-password-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cp-current">현재 비밀번호</Label>
          <Input
            id="cp-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력하세요"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cp-new">새 비밀번호</Label>
          <Input
            id="cp-new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8자 이상 입력하세요"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cp-confirm">새 비밀번호 확인</Label>
          <Input
            id="cp-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호를 다시 입력하세요"
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <div
            className="rounded-md px-4 py-3 text-[13px]"
            style={{
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-bg)',
            }}
          >
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}

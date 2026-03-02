import React, { useState } from 'react';
import { toast } from 'sonner';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Label from './Label';
import { useRequestCreateTeam } from '../../hooks/useTeams';

interface TeamCreateRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TeamCreateRequestModal({ open, onClose }: TeamCreateRequestModalProps) {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const { mutate: requestCreate, isPending } = useRequestCreateTeam();

  const reset = () => {
    setTeamName('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = teamName.trim();
    if (!trimmed) {
      setError('팀명을 입력하세요.');
      return;
    }
    if (trimmed.length < 2) {
      setError('팀명은 최소 2자 이상이어야 합니다.');
      return;
    }
    setError('');
    requestCreate(trimmed, {
      onSuccess: () => {
        toast.success(`"${trimmed}" 팀 생성 신청이 완료되었습니다.`);
        handleClose();
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          '팀 생성 신청에 실패했습니다.';
        setError(msg);
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="팀 생성 신청"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            취소
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="team-create-form"
            disabled={isPending}
          >
            {isPending ? '신청 중...' : '신청하기'}
          </Button>
        </>
      }
    >
      <form id="team-create-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div
          className="rounded-md px-4 py-3 text-[12.5px]"
          style={{
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--primary)',
            border: '1px solid var(--primary-bg)',
          }}
        >
          팀 생성 신청 후 관리자 승인을 거쳐 팀이 개설됩니다. 승인 완료 시 알림을 받게 됩니다.
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="team-name-input">팀명</Label>
          <Input
            id="team-name-input"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="신청할 팀명을 입력하세요"
            maxLength={50}
            autoFocus
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

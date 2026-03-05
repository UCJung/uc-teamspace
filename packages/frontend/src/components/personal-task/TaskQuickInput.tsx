import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCreatePersonalTask } from '../../hooks/usePersonalTasks';
import { useTeamStore } from '../../stores/teamStore';

export default function TaskQuickInput() {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentTeamId } = useTeamStore();
  const createMutation = useCreatePersonalTask();

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || !currentTeamId) return;

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        teamId: currentTeamId,
        title: trimmed,
        priority: 'MEDIUM',
      });
      setValue('');
      toast.success('작업이 추가되었습니다');
    } catch {
      toast.error('작업 추가에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-3 border"
      style={{
        backgroundColor: 'var(--white)',
        borderColor: 'var(--gray-border)',
      }}
    >
      <Plus size={16} style={{ color: 'var(--text-sub)', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="작업 추가... (Enter로 등록)"
        disabled={isSubmitting}
        className="flex-1 text-[13px] bg-transparent outline-none"
        style={{ color: 'var(--text)' }}
      />
      {value.trim() && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="text-[11px] px-2 py-1 rounded"
          style={{
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--primary)',
          }}
        >
          {isSubmitting ? '추가 중...' : 'Enter로 등록'}
        </button>
      )}
    </div>
  );
}

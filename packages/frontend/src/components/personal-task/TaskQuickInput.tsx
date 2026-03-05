import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useCreatePersonalTask } from '../../hooks/usePersonalTasks';
import { useTeamStore } from '../../stores/teamStore';

interface TaskQuickInputProps {
  /** ISO date string (e.g. "2026-03-10") — pre-fills scheduledDate */
  defaultScheduledDate?: string;
  /** Called after successful create or cancel, so parent can clear the date */
  onDone?: () => void;
}

function formatDateBadge(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}/${d.getDate()} 예정`;
}

export default function TaskQuickInput({ defaultScheduledDate, onDone }: TaskQuickInputProps) {
  const [value, setValue] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string | undefined>(defaultScheduledDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentTeamId } = useTeamStore();
  const createMutation = useCreatePersonalTask();

  // Sync scheduledDate when defaultScheduledDate prop changes
  useEffect(() => {
    setScheduledDate(defaultScheduledDate);
  }, [defaultScheduledDate]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || !currentTeamId) return;

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        teamId: currentTeamId,
        title: trimmed,
        priority: 'MEDIUM',
        ...(scheduledDate ? { scheduledDate } : {}),
      });
      setValue('');
      setScheduledDate(undefined);
      toast.success('작업이 추가되었습니다');
      onDone?.();
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
    if (e.key === 'Escape') {
      setValue('');
      setScheduledDate(undefined);
      onDone?.();
    }
  };

  const handleClearDate = () => {
    setScheduledDate(undefined);
    onDone?.();
  };

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-3 border"
      style={{
        backgroundColor: 'var(--white)',
        borderColor: scheduledDate ? 'var(--primary)' : 'var(--gray-border)',
        boxShadow: scheduledDate ? '0 0 0 2px var(--primary-bg)' : undefined,
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

      {/* Scheduled date badge */}
      {scheduledDate && (
        <div
          className="flex items-center gap-1 rounded-full px-2 py-0.5 flex-shrink-0"
          style={{
            backgroundColor: 'var(--primary-bg)',
            color: 'var(--primary)',
          }}
        >
          <Calendar size={11} />
          <span className="text-[11px] font-medium">{formatDateBadge(scheduledDate)}</span>
          <button
            type="button"
            onClick={handleClearDate}
            className="ml-0.5 rounded-full hover:opacity-70 transition-opacity"
            aria-label="날짜 제거"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {value.trim() && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="text-[11px] px-2 py-1 rounded flex-shrink-0"
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

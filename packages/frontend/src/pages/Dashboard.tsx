import React from 'react';
import SummaryCard from '../components/ui/SummaryCard';
import { useAuthStore } from '../stores/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <p className="text-[var(--text-sub)] text-[12px] mb-4">
        안녕하세요, <strong>{user?.name}</strong>님. 오늘도 좋은 하루 되세요.
      </p>
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="이번 주 작성 상태" value="준비 중" />
        <SummaryCard label="파트 작성 현황" value="—" />
        <SummaryCard label="제출 완료" value="—" />
        <SummaryCard label="미제출" value="—" />
      </div>
    </div>
  );
}

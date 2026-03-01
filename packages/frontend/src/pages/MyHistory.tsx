import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';

// 더미 데이터 (실제 구현 시 API 호출)
const DUMMY_HISTORY = [
  { weekLabel: '2026-W08', workItemCount: 5, status: 'SUBMITTED' as const },
  { weekLabel: '2026-W07', workItemCount: 4, status: 'SUBMITTED' as const },
  { weekLabel: '2026-W06', workItemCount: 3, status: 'DRAFT' as const },
];

function formatWeekLabel(weekLabel: string): string {
  const match = weekLabel.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekLabel;
  const year = match[1];
  const week = parseInt(match[2], 10);
  return `${year}년 ${week}주차`;
}

export default function MyHistory() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="bg-white rounded-lg border border-[var(--gray-border)] overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[var(--tbl-header)] border-b border-[var(--gray-border)]">
              <th className="text-left px-4 py-2.5 font-medium text-[var(--text-sub)]">주차</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--text-sub)]">업무항목 수</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--text-sub)]">상태</th>
              <th className="text-right px-4 py-2.5 font-medium text-[var(--text-sub)]">이동</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_HISTORY.map((item, idx) => (
              <tr
                key={item.weekLabel}
                className={[
                  'border-b border-[var(--gray-border)] hover:bg-[var(--row-alt)] cursor-pointer',
                  idx % 2 === 1 ? 'bg-[var(--row-alt)]' : '',
                ].join(' ')}
                onClick={() => navigate(`/my-weekly?week=${item.weekLabel}`)}
              >
                <td className="px-4 py-2.5 font-medium">{formatWeekLabel(item.weekLabel)}</td>
                <td className="px-4 py-2.5 text-[var(--text-sub)]">{item.workItemCount}건</td>
                <td className="px-4 py-2.5">
                  <Badge variant={item.status === 'SUBMITTED' ? 'ok' : 'warn'} dot>
                    {item.status === 'SUBMITTED' ? '제출 완료' : '임시저장'}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-right text-[var(--primary)] text-[11px]">
                  바로가기 →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

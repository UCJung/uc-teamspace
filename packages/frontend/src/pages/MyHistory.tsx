import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../components/ui/Table';

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
        <div
          className="flex items-center justify-between border-b border-[var(--gray-border)]"
          style={{ padding: '11px 16px' }}
        >
          <p className="text-[13px] font-semibold text-[var(--text)]">업무 이력</p>
          <p className="text-[12px] text-[var(--text-sub)]">총 {DUMMY_HISTORY.length}건</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주차</TableHead>
              <TableHead>업무항목 수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">이동</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_HISTORY.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-[var(--text-sub)]">
                  업무 이력이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {DUMMY_HISTORY.map((item, idx) => (
              <TableRow
                key={item.weekLabel}
                className={[
                  'cursor-pointer',
                  idx % 2 === 1 ? 'bg-[var(--row-alt)]' : '',
                ].join(' ')}
                onClick={() => navigate(`/my-weekly?week=${item.weekLabel}`)}
              >
                <TableCell className="font-medium">{formatWeekLabel(item.weekLabel)}</TableCell>
                <TableCell className="text-[var(--text-sub)]">{item.workItemCount}건</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'SUBMITTED' ? 'ok' : 'warn'} dot>
                    {item.status === 'SUBMITTED' ? '제출 완료' : '임시저장'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-[var(--primary)] text-[11px]">
                  바로가기 →
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

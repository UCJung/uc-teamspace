import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SummaryCard from '../components/ui/SummaryCard';
import { useAuthStore } from '../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { partApi } from '../api/part.api';

function getWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function addWeeks(weekLabel: string, n: number): string {
  const match = weekLabel.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekLabel;
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(Date.UTC(year, 0, 4 - jan4Day + 1));
  const monday = new Date(week1Monday.getTime() + (week - 1 + n) * 7 * 86400000);
  return getWeekLabel(monday);
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [currentWeek] = useState(() => getWeekLabel(new Date()));

  const isLeader = user?.role === 'LEADER';
  const isPartLeader = user?.role === 'PART_LEADER';
  const partId = user?.partId ?? '';
  const teamId = (user as unknown as { teamId?: string })?.teamId ?? '1';

  // 파트장/팀장: 팀 전체 현황 조회
  const { data: teamOverview = [] } = useQuery({
    queryKey: ['team-weekly-overview', teamId, currentWeek],
    queryFn: () =>
      partApi.getTeamWeeklyOverview(teamId, currentWeek).then((r) => r.data.data),
    enabled: (isLeader || isPartLeader) && !!teamId,
  });

  // 파트장: 파트 작성 현황 조회
  const { data: submissionList = [] } = useQuery({
    queryKey: ['part-submission-status', partId, currentWeek],
    queryFn: () =>
      partApi.getSubmissionStatus(partId, currentWeek).then((r) => r.data.data),
    enabled: isPartLeader && !!partId,
  });

  // 집계 계산
  const allMembers = teamOverview.flatMap((o) => o.members);
  const totalMembers = isLeader ? allMembers.length : submissionList.length;
  const submittedCount = isLeader
    ? allMembers.filter((m) => m.report?.status === 'SUBMITTED').length
    : submissionList.filter((s) => s.status === 'SUBMITTED').length;
  const notSubmittedCount = totalMembers - submittedCount;

  const partSummaries = teamOverview.map((o) => ({
    partName: o.part.name,
    status: o.summaryStatus,
  }));

  // 최근 4주 라벨
  const recentWeeks = Array.from({ length: 4 }, (_, i) => addWeeks(currentWeek, -i));

  return (
    <div>
      <p className="text-[var(--text-sub)] text-[12px] mb-5">
        안녕하세요, <strong className="text-[var(--text)]">{user?.name}</strong>님. 이번 주{' '}
        <span className="font-medium text-[var(--primary)]">{currentWeek}</span> 업무 현황입니다.
      </p>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {isLeader ? (
          <>
            <SummaryCard
              icon="👥"
              label="전체 팀원"
              value={totalMembers}
              subText="명"
            />
            <SummaryCard
              icon="✅"
              label="이번 주 제출"
              value={`${submittedCount} / ${totalMembers}`}
              subText="명 제출 완료"
            />
            <SummaryCard
              icon="📋"
              label="파트 취합 현황"
              value={partSummaries.filter((p) => p.status === 'SUBMITTED').length}
              subText={`${partSummaries.length}개 파트 중 제출`}
            />
            <SummaryCard
              icon="❌"
              label="미제출 인원"
              value={notSubmittedCount}
              subText="명"
            />
          </>
        ) : isPartLeader ? (
          <>
            <SummaryCard
              icon="👥"
              label="파트 인원"
              value={totalMembers}
              subText="명"
            />
            <SummaryCard
              icon="✅"
              label="이번 주 제출"
              value={`${submittedCount} / ${totalMembers}`}
              subText="명 제출 완료"
            />
            <SummaryCard
              icon="❌"
              label="미제출 인원"
              value={notSubmittedCount}
              subText="명"
            />
            <SummaryCard
              icon="📝"
              label="임시저장"
              value={submissionList.filter((s) => s.status === 'DRAFT').length}
              subText="명"
            />
          </>
        ) : (
          <>
            <SummaryCard icon="📅" label="이번 주" value={currentWeek} />
            <SummaryCard icon="📝" label="작업 상태" value="작성 중" subText="내 주간업무" />
            <SummaryCard icon="🗂️" label="소속 파트" value={user?.partName ?? '—'} />
            <SummaryCard icon="👤" label="역할" value="팀원" />
          </>
        )}
      </div>

      {/* 빠른 진입 링크 */}
      <div className="bg-white rounded-lg border border-[var(--gray-border)] px-5 py-4 mb-6">
        <p className="text-[11px] font-medium text-[var(--text-sub)] mb-3">빠른 진입</p>
        <div className="flex gap-3">
          {user?.role === 'MEMBER' && (
            <Link to="/my-report">
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded text-[13px] font-medium hover:bg-[var(--primary-dark)] transition-colors">
                내 주간업무 작성하기
              </button>
            </Link>
          )}
          {isPartLeader && (
            <>
              <Link to="/my-report">
                <button className="px-4 py-2 bg-[var(--primary)] text-white rounded text-[13px] font-medium hover:bg-[var(--primary-dark)] transition-colors">
                  내 주간업무 작성하기
                </button>
              </Link>
              <Link to="/part-summary">
                <button className="px-4 py-2 bg-white border border-[var(--primary)] text-[var(--primary)] rounded text-[13px] font-medium hover:bg-[var(--primary-bg)] transition-colors">
                  파트 취합하기
                </button>
              </Link>
            </>
          )}
          {isLeader && (
            <Link to="/team-status">
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded text-[13px] font-medium hover:bg-[var(--primary-dark)] transition-colors">
                팀 현황 보기
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* 최근 주차 이력 */}
      <div className="bg-white rounded-lg border border-[var(--gray-border)] px-5 py-4">
        <p className="text-[11px] font-medium text-[var(--text-sub)] mb-3">최근 4주</p>
        <div className="flex gap-2">
          {recentWeeks.map((week) => (
            <div
              key={week}
              className={[
                'flex-1 px-3 py-2.5 rounded border text-center',
                week === currentWeek
                  ? 'border-[var(--primary)] bg-[var(--primary-bg)]'
                  : 'border-[var(--gray-border)]',
              ].join(' ')}
            >
              <p
                className={[
                  'text-[12px] font-medium',
                  week === currentWeek ? 'text-[var(--primary)]' : 'text-[var(--text)]',
                ].join(' ')}
              >
                {week}
              </p>
              {week === currentWeek && (
                <p className="text-[10px] text-[var(--primary)] mt-0.5">이번 주</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

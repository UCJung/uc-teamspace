import React, { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { TIMESHEET_STATUS_LABEL, TIMESHEET_STATUS_VARIANT, ATTENDANCE_LABEL, WORK_TYPE_LABEL } from '../../constants/labels';
import { useTimesheetDetail } from '../../hooks/useTimesheet';
import Badge from './Badge';

interface TimesheetDetailPopupProps {
  timesheetId: string;
  memberName: string;
  onClose: () => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// sticky 열 너비 / left 상수
const COL_W = { date: 46, day: 46, att: 90, total: 60 };
const COL_LEFT = {
  date: 0,
  day: COL_W.date,
  att: COL_W.date + COL_W.day,
  total: COL_W.date + COL_W.day + COL_W.att,
};
const stickyBase: React.CSSProperties = { position: 'sticky', zIndex: 1 };
const stickyHeadFoot: React.CSSProperties = { position: 'sticky', zIndex: 3 };

function getRequiredHours(attendance: string): number {
  if (attendance === 'WORK' || attendance === 'HOLIDAY_WORK') return 8;
  if (attendance === 'HALF_DAY_LEAVE') return 4;
  return 0;
}

function getHoursColor(total: number, required: number): string {
  if (required === 0) return 'var(--text-sub)';
  if (total === required) return 'var(--ok)';
  if (total > 0) return 'var(--danger)';
  return 'var(--text-sub)';
}

export default function TimesheetDetailPopup({
  timesheetId,
  memberName,
  onClose,
}: TimesheetDetailPopupProps) {
  const { data: ts, isLoading } = useTimesheetDetail(timesheetId);

  // ESC 키 핸들러
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // 날짜 정렬
  const sortedEntries = useMemo(() => {
    if (!ts?.entries) return [];
    return [...ts.entries].sort((a, b) => a.date.localeCompare(b.date));
  }, [ts]);

  // 프로젝트 목록 추출 (entries의 workLogs에서 고유 프로젝트)
  const projects = useMemo(() => {
    if (!ts?.entries) return [];
    const map = new Map<string, { id: string; name: string; code: string }>();
    for (const entry of ts.entries) {
      for (const wl of entry.workLogs) {
        if (wl.project && !map.has(wl.projectId)) {
          map.set(wl.projectId, wl.project);
        }
      }
    }
    return Array.from(map.values());
  }, [ts]);

  // 프로젝트별 월간합계
  const monthlyTotals = useMemo(() => {
    let grandTotal = 0;
    const projectTotals: Record<string, number> = {};
    for (const entry of sortedEntries) {
      for (const wl of entry.workLogs) {
        grandTotal += wl.hours;
        projectTotals[wl.projectId] = (projectTotals[wl.projectId] ?? 0) + wl.hours;
      }
    }
    return { grandTotal, projectTotals };
  }, [sortedEntries]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col"
        style={{ width: '95vw', height: '90vh', maxWidth: '1400px' }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--gray-border)' }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>
              {memberName}님의 근무시간표
            </h2>
            {ts && (
              <Badge variant={TIMESHEET_STATUS_VARIANT[ts.status] ?? 'gray'}>
                {TIMESHEET_STATUS_LABEL[ts.status] ?? ts.status}
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-sub)', border: '1px solid var(--gray-border)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
          {isLoading ? (
            <div
              className="flex items-center justify-center h-full text-[13px]"
              style={{ color: 'var(--text-sub)' }}
            >
              불러오는 중...
            </div>
          ) : !ts ? (
            <div
              className="flex items-center justify-center h-full text-[13px]"
              style={{ color: 'var(--text-sub)' }}
            >
              시간표 데이터가 없습니다.
            </div>
          ) : (
            <table
              className="border-collapse text-[12px]"
              style={{ width: 'max-content', minWidth: '100%' }}
            >
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr style={{ backgroundColor: 'var(--tbl-header)' }}>
                  <th
                    className="px-2 py-2 text-left font-semibold"
                    style={{
                      ...stickyHeadFoot,
                      left: COL_LEFT.date,
                      color: 'var(--text-sub)',
                      borderBottom: '1px solid var(--gray-border)',
                      width: COL_W.date,
                      minWidth: COL_W.date,
                      backgroundColor: 'var(--tbl-header)',
                    }}
                  >
                    날짜
                  </th>
                  <th
                    className="px-2 py-2 text-left font-semibold"
                    style={{
                      ...stickyHeadFoot,
                      left: COL_LEFT.day,
                      color: 'var(--text-sub)',
                      borderBottom: '1px solid var(--gray-border)',
                      width: COL_W.day,
                      minWidth: COL_W.day,
                      backgroundColor: 'var(--tbl-header)',
                    }}
                  >
                    요일
                  </th>
                  <th
                    className="px-2 py-2 text-left font-semibold"
                    style={{
                      ...stickyHeadFoot,
                      left: COL_LEFT.att,
                      color: 'var(--text-sub)',
                      borderBottom: '1px solid var(--gray-border)',
                      width: COL_W.att,
                      minWidth: COL_W.att,
                      backgroundColor: 'var(--tbl-header)',
                    }}
                  >
                    근태
                  </th>
                  <th
                    className="px-2 py-2 text-right font-semibold"
                    style={{
                      ...stickyHeadFoot,
                      left: COL_LEFT.total,
                      color: 'var(--text-sub)',
                      borderBottom: '1px solid var(--gray-border)',
                      width: COL_W.total,
                      minWidth: COL_W.total,
                      backgroundColor: 'var(--tbl-header)',
                      borderRight:
                        projects.length > 0 ? '2px solid var(--gray-border)' : undefined,
                    }}
                  >
                    합계
                  </th>
                  {projects.map((p) => (
                    <th
                      key={p.id}
                      className="px-2 py-2 font-semibold"
                      style={{
                        color: 'var(--text-sub)',
                        borderBottom: '1px solid var(--gray-border)',
                        minWidth: '150px',
                      }}
                    >
                      <div className="truncate">{p.name}</div>
                      <div className="text-[10px] font-normal">[{p.code}]</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry) => {
                  const d = new Date(entry.date);
                  const dayOfWeek = d.getUTCDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const totalH = entry.workLogs.reduce((s, wl) => s + wl.hours, 0);
                  const required = getRequiredHours(entry.attendance);
                  const isHoliday = entry.attendance === 'HOLIDAY';
                  const isLeave = entry.attendance === 'ANNUAL_LEAVE';
                  const noInput = isHoliday || isLeave;
                  const rowBg = noInput
                    ? '#F3F4F6'
                    : required > 0 && totalH === required
                      ? '#ECFDF5'
                      : required > 0 && totalH > 0 && totalH !== required
                        ? '#FEF2F2'
                        : isWeekend
                          ? 'var(--row-alt)'
                          : 'white';
                  const cellFilledBg = noInput
                    ? '#F3F4F6'
                    : required > 0 && totalH === required
                      ? '#D1FAE5'
                      : required > 0 && totalH > 0 && totalH !== required
                        ? '#FEE2E2'
                        : '#EDE9FF';

                  return (
                    <tr
                      key={entry.id}
                      style={{
                        backgroundColor: rowBg,
                        borderBottom: '1px solid var(--gray-border)',
                      }}
                    >
                      <td
                        className="px-2 py-1.5 font-medium"
                        style={{
                          ...stickyBase,
                          left: COL_LEFT.date,
                          backgroundColor: rowBg,
                          color: 'var(--text)',
                        }}
                      >
                        {d.getUTCDate()}
                      </td>
                      <td
                        className="px-2 py-1.5"
                        style={{
                          ...stickyBase,
                          left: COL_LEFT.day,
                          backgroundColor: rowBg,
                          color:
                            dayOfWeek === 0
                              ? 'var(--danger)'
                              : dayOfWeek === 6
                                ? 'var(--primary)'
                                : 'var(--text-sub)',
                        }}
                      >
                        {DAY_LABELS[dayOfWeek]}
                      </td>
                      <td
                        className="px-2 py-1.5"
                        style={{
                          ...stickyBase,
                          left: COL_LEFT.att,
                          backgroundColor: rowBg,
                          color: 'var(--text)',
                        }}
                      >
                        {ATTENDANCE_LABEL[entry.attendance] ?? entry.attendance}
                      </td>
                      <td
                        className="px-2 py-1.5 text-right font-medium"
                        style={{
                          ...stickyBase,
                          left: COL_LEFT.total,
                          backgroundColor: rowBg,
                          color: getHoursColor(totalH, required),
                          borderRight:
                            projects.length > 0 ? '2px solid var(--gray-border)' : undefined,
                        }}
                      >
                        {required > 0 ? (
                          <>
                            {totalH}
                            <span
                              className="text-[10px] ml-0.5"
                              style={{ color: 'var(--text-sub)' }}
                            >
                              /{required}h
                            </span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-sub)' }}>—</span>
                        )}
                      </td>
                      {projects.map((p) => {
                        const wl = entry.workLogs.find((w) => w.projectId === p.id);
                        const hasFilled = (wl?.hours ?? 0) > 0;
                        const needsDisplay = !noInput;
                        return (
                          <td
                            key={p.id}
                            className="px-1 py-1"
                            style={
                              hasFilled && needsDisplay
                                ? { backgroundColor: cellFilledBg }
                                : undefined
                            }
                          >
                            {needsDisplay && wl ? (
                              <div className="flex gap-1">
                                <span
                                  className="w-14 text-center"
                                  style={{ color: 'var(--text)' }}
                                >
                                  {wl.hours}h
                                </span>
                                <span style={{ color: 'var(--text-sub)' }}>
                                  {WORK_TYPE_LABEL[wl.workType] ?? wl.workType}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-sub)' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 2 }}>
                <tr
                  style={{
                    backgroundColor: 'var(--tbl-header)',
                    borderTop: '2px solid var(--gray-border)',
                  }}
                >
                  <td
                    className="px-2 py-2 font-semibold text-[12px]"
                    style={{
                      ...stickyHeadFoot,
                      left: COL_LEFT.date,
                      backgroundColor: 'var(--tbl-header)',
                      color: 'var(--text)',
                    }}
                  >
                    월간
                  </td>
                  <td
                    className="px-2 py-2 font-semibold text-[12px]"
                    style={{
                      ...stickyHeadFoot,
                      left: COL_LEFT.day,
                      backgroundColor: 'var(--tbl-header)',
                      color: 'var(--text)',
                    }}
                  >
                    합계
                  </td>
                  <td
                    className="px-2 py-2 text-[12px]"
                    style={{
                      ...stickyHeadFoot,
                      left: COL_LEFT.att,
                      backgroundColor: 'var(--tbl-header)',
                    }}
                  />
                  <td
                    className="px-2 py-2 text-right font-semibold text-[12px]"
                    style={{
                      ...stickyHeadFoot,
                      left: COL_LEFT.total,
                      backgroundColor: 'var(--tbl-header)',
                      color: 'var(--text)',
                      borderRight:
                        projects.length > 0 ? '2px solid var(--gray-border)' : undefined,
                    }}
                  >
                    {monthlyTotals.grandTotal}h
                  </td>
                  {projects.map((p) => {
                    const h = monthlyTotals.projectTotals[p.id] ?? 0;
                    const pct =
                      monthlyTotals.grandTotal > 0
                        ? Math.round((h / monthlyTotals.grandTotal) * 100)
                        : 0;
                    return (
                      <td
                        key={p.id}
                        className="px-2 py-2 font-semibold text-[12px]"
                        style={{ color: 'var(--primary)' }}
                      >
                        {h}h
                        {h > 0 && (
                          <span
                            className="text-[10px] font-normal ml-1"
                            style={{ color: 'var(--text-sub)' }}
                          >
                            ({pct}%)
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

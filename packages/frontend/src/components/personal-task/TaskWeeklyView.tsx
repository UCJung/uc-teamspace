import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { PersonalTask } from '../../api/personal-task.api';
import TaskKanbanCard from './TaskKanbanCard';

interface TaskWeeklyViewProps {
  tasks: PersonalTask[];
  isLoading: boolean;
  selectedTaskId?: string;
  onSelectTask: (task: PersonalTask) => void;
  onClickEmptyDate?: (date: Date) => void;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/** Get Sunday of the week that contains the given date */
function getWeekSunday(date: Date, offsetWeeks: number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day + offsetWeeks * 7);
  return d;
}

function formatColumnHeader(sunday: Date, dayIndex: number): string {
  const d = new Date(sunday);
  d.setDate(sunday.getDate() + dayIndex);
  return `${d.getMonth() + 1}/${d.getDate()} ${DAY_NAMES[dayIndex]}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(sunday: Date, dayIndex: number): boolean {
  const d = new Date(sunday);
  d.setDate(sunday.getDate() + dayIndex);
  return isSameDay(d, new Date());
}

/** Get the Date object for a specific day column */
function getColumnDate(sunday: Date, dayIndex: number): Date {
  const d = new Date(sunday);
  d.setDate(sunday.getDate() + dayIndex);
  return d;
}

export default function TaskWeeklyView({
  tasks,
  isLoading,
  selectedTaskId,
  onSelectTask,
  onClickEmptyDate,
}: TaskWeeklyViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const sunday = useMemo(() => getWeekSunday(new Date(), weekOffset), [weekOffset]);

  // Compute the Saturday (end of week)
  const saturday = useMemo(() => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + 6);
    return d;
  }, [sunday]);

  // Partition tasks into day columns
  const columns = useMemo(() => {
    // 0-6: Sun-Sat, 7: 예정업무
    const cols: PersonalTask[][] = Array.from({ length: 8 }, () => []);

    for (const task of tasks) {
      // scheduledDate 최우선 처리
      if (task.scheduledDate) {
        const scheduledDate = new Date(task.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);
        if (scheduledDate >= sunday && scheduledDate <= saturday) {
          const dayIndex = scheduledDate.getDay(); // 0=Sun
          cols[dayIndex].push(task);
        } else {
          // 범위 밖이면 예정업무 열
          cols[7].push(task);
        }
        continue;
      }

      // scheduledDate 없으면 기존 로직
      if (task.taskStatus.category === 'COMPLETED' && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        // Within this week?
        if (completedDate >= sunday && completedDate <= saturday) {
          const dayIndex = completedDate.getDay(); // 0=Sun
          cols[dayIndex].push(task);
        }
        // else: out of range, don't show
      } else if (task.taskStatus.category === 'IN_PROGRESS' && task.startedAt) {
        const startedDate = new Date(task.startedAt);
        startedDate.setHours(0, 0, 0, 0);
        if (startedDate >= sunday && startedDate <= saturday) {
          const dayIndex = startedDate.getDay();
          cols[dayIndex].push(task);
        }
        // else: out of range, also put in 예정업무
        else {
          cols[7].push(task);
        }
      } else {
        // BEFORE_START or unknown → 예정업무
        cols[7].push(task);
      }
    }

    return cols;
  }, [tasks, sunday, saturday]);

  const isThisWeek = weekOffset === 0;

  if (isLoading) {
    return (
      <div
        className="rounded-lg border px-4 py-10 text-center text-[13px]"
        style={{
          borderColor: 'var(--gray-border)',
          backgroundColor: 'var(--white)',
          color: 'var(--text-sub)',
        }}
      >
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Week navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWeekOffset((v) => v - 1)}
          className="p-1 rounded hover:bg-[var(--gray-light)] transition-colors"
          style={{ color: 'var(--text-sub)' }}
          aria-label="이전 주"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
          {sunday.getMonth() + 1}/{sunday.getDate()}
          {' '}—{' '}
          {saturday.getMonth() + 1}/{saturday.getDate()}
        </span>

        {!isThisWeek && (
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="text-[11px] px-2 py-0.5 rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--primary)',
            }}
          >
            이번 주
          </button>
        )}

        <button
          type="button"
          onClick={() => setWeekOffset((v) => v + 1)}
          className="p-1 rounded hover:bg-[var(--gray-light)] transition-colors"
          style={{ color: 'var(--text-sub)' }}
          aria-label="다음 주"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Columns */}
      <div className="flex gap-2 flex-1 min-h-0 overflow-x-auto pb-2">
        {/* Day columns 0-6: Sun-Sat */}
        {Array.from({ length: 7 }, (_, dayIndex) => {
          const todayCol = isThisWeek && isToday(sunday, dayIndex);
          const colTasks = columns[dayIndex];
          const colDate = getColumnDate(sunday, dayIndex);

          const handleEmptyAreaClick = () => {
            if (onClickEmptyDate) {
              onClickEmptyDate(colDate);
            }
          };

          return (
            <div
              key={dayIndex}
              className="flex flex-col rounded-xl overflow-hidden h-full"
              style={{
                flex: '1 1 0',
                minWidth: 120,
                border: todayCol
                  ? '1.5px solid var(--primary)'
                  : '1px solid var(--gray-border)',
              }}
            >
              {/* Header */}
              <div
                className="px-2 py-1.5 text-center flex-shrink-0"
                style={{
                  backgroundColor: todayCol ? 'var(--primary-bg)' : 'var(--gray-light)',
                }}
              >
                <span
                  className="text-[11.5px] font-semibold"
                  style={{ color: todayCol ? 'var(--primary)' : 'var(--text-sub)' }}
                >
                  {formatColumnHeader(sunday, dayIndex)}
                </span>
              </div>

              {/* Cards + empty area */}
              <div
                className="flex flex-col gap-1.5 p-1.5 flex-1 overflow-y-auto"
                style={{
                  backgroundColor: todayCol ? 'var(--primary-bg)' : 'var(--white, #fff)',
                  minHeight: 200,
                  cursor: onClickEmptyDate ? 'pointer' : undefined,
                }}
                onClick={colTasks.length === 0 ? handleEmptyAreaClick : undefined}
              >
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskKanbanCard
                      task={task}
                      compact
                      isSelected={selectedTaskId === task.id}
                      onSelect={onSelectTask}
                    />
                  </div>
                ))}
                {colTasks.length === 0 && onClickEmptyDate ? (
                  <div
                    className="flex-1 flex flex-col items-center justify-center gap-1 group"
                    style={{ color: 'var(--gray-border)', minHeight: 60 }}
                  >
                    <Plus
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: todayCol ? 'var(--primary)' : 'var(--text-sub)' }}
                    />
                    <span
                      className="text-[11px] opacity-0 group-hover:opacity-70 transition-opacity"
                      style={{ color: todayCol ? 'var(--primary)' : 'var(--text-sub)' }}
                    >
                      추가
                    </span>
                  </div>
                ) : colTasks.length === 0 ? (
                  <div
                    className="flex-1 flex items-center justify-center text-[11px]"
                    style={{ color: 'var(--gray-border)', minHeight: 60 }}
                  >
                    —
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* 예정업무 column */}
        <div
          className="flex flex-col rounded-xl overflow-hidden h-full"
          style={{
            flex: '1 1 0',
            minWidth: 140,
            border: '1px solid var(--gray-border)',
          }}
        >
          <div
            className="px-2 py-1.5 text-center flex-shrink-0"
            style={{ backgroundColor: 'var(--warn-bg)' }}
          >
            <span className="text-[11.5px] font-semibold" style={{ color: 'var(--warn)' }}>
              예정업무
            </span>
          </div>
          <div
            className="flex flex-col gap-1.5 p-1.5 flex-1 overflow-y-auto"
            style={{ backgroundColor: 'var(--warn-bg)', minHeight: 200 }}
          >
            {columns[7].map((task) => (
              <TaskKanbanCard
                key={task.id}
                task={task}
                compact
                isSelected={selectedTaskId === task.id}
                onSelect={onSelectTask}
              />
            ))}
            {columns[7].length === 0 && (
              <div
                className="flex-1 flex items-center justify-center text-[11px]"
                style={{ color: 'var(--warn)', minHeight: 60 }}
              >
                예정 없음
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { describe, it, expect } from 'vitest';
import { PersonalTask } from '../../api/personal-task.api';
import { taskToCell, hourToRow, hasTime } from './WeeklyTimeGrid';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** 테스트용 PersonalTask 팩토리 */
function makeTask(overrides: Partial<PersonalTask> = {}): PersonalTask {
  return {
    id: 'task-1',
    memberId: 'member-1',
    teamId: 'team-1',
    title: '테스트 작업',
    priority: 'MEDIUM',
    statusId: 'status-todo',
    taskStatus: {
      id: 'status-todo',
      name: '할일',
      category: 'BEFORE_START',
      color: '#6B5CE7',
      sortOrder: 1,
    },
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * ISO datetime 문자열을 로컬 시간 기준으로 생성한다.
 * new Date(year, month-1, day, hour) 는 로컬 시간 기준이므로
 * getHours() 로 조회 시 원래 hour가 반환된다.
 */
function localDatetime(year: number, month: number, day: number, hour: number): string {
  return new Date(year, month - 1, day, hour, 0, 0, 0).toISOString();
}

/** 로컬 날짜만 (시간 없음) */
function localDateOnly(year: number, month: number, day: number): string {
  // "YYYY-MM-DD" 형식 — hasTime()은 new Date("YYYY-MM-DD").getHours()를 사용하는데
  // 이는 UTC 자정이므로 시간대에 따라 결과가 다를 수 있다.
  // 따라서 로컬 자정 ISO로 생성한다.
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

// 이번 주 일요일 (2026-03-01 일요일 기준)
// 실제 날짜와 무관하게 고정값 사용
const SUNDAY = new Date(2026, 2, 1, 0, 0, 0, 0); // 2026-03-01 (일)
const SATURDAY = new Date(2026, 2, 7, 23, 59, 59, 999); // 2026-03-07 (토)

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('hourToRow', () => {
  it('8시 → row 3', () => {
    expect(hourToRow(8)).toBe(3);
  });

  it('9시 → row 4', () => {
    expect(hourToRow(9)).toBe(4);
  });

  it('14시 → row 9', () => {
    expect(hourToRow(14)).toBe(9);
  });

  it('18시 → row 13', () => {
    expect(hourToRow(18)).toBe(13);
  });

  it('19시 → row 14 (야간)', () => {
    expect(hourToRow(19)).toBe(14);
  });

  it('20시 → row 14 (야간, 상한 클램프)', () => {
    expect(hourToRow(20)).toBe(14);
  });

  it('7시 → row 2 (~07:59)', () => {
    expect(hourToRow(7)).toBe(2);
  });

  it('0시 → row 2 (8시 미만)', () => {
    expect(hourToRow(0)).toBe(2);
  });
});

describe('hasTime', () => {
  it('로컬 14:00 datetime → true', () => {
    const dt = localDatetime(2026, 3, 5, 14);
    expect(hasTime(dt)).toBe(true);
  });

  it('로컬 00:00:00 datetime → false', () => {
    const dt = localDateOnly(2026, 3, 5);
    expect(hasTime(dt)).toBe(false);
  });
});

describe('taskToCell', () => {
  // ── 1. 시간 있는 task ───────────────────────────────────────────────

  it('scheduledDate 14:00 (이번 주 월요일) → col 2, rowStart 9', () => {
    // 2026-03-02 (월) = sunday(2026-03-01) + 1
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 2, 14),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.col).toBe(2); // 월요일 = dayIndex 1 → col 2
    expect(result.rowStart).toBe(9); // hourToRow(14) = 9
  });

  it('scheduledDate 09:00 (이번 주 수요일) → col 4, rowStart 4', () => {
    // 2026-03-04 (수) = sunday(2026-03-01) + 3
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 4, 9),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.col).toBe(4); // 수요일 = dayIndex 3 → col 4
    expect(result.rowStart).toBe(4); // hourToRow(9) = 4
  });

  // ── 2. 시간 없는 task → 종일 행 ────────────────────────────────────

  it('scheduledDate 날짜만 (시간 없음) → rowStart 1 (종일)', () => {
    const task = makeTask({
      scheduledDate: localDateOnly(2026, 3, 3), // 2026-03-03 00:00
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.rowStart).toBe(1); // 종일 행
  });

  // ── 3. 8시 이전 task → ~07:59 행 (rowIndex 2) ─────────────────────

  it('scheduledDate 6:00 (8시 이전) → rowStart 2 (~07:59)', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 3, 6),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.rowStart).toBe(2); // hourToRow(6) = 2
  });

  it('scheduledDate 0:00 이지만 hasTime = false → rowStart 1 (종일)', () => {
    // 로컬 자정은 hasTime()이 false를 반환함
    const task = makeTask({
      scheduledDate: localDateOnly(2026, 3, 3),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    // hasTime이 false이므로 종일 행으로 배치
    expect(result.rowStart).toBe(1);
  });

  // ── 4. 19시 이후 task → 야간 행 (rowIndex 14) ─────────────────────

  it('scheduledDate 19:00 (야간) → rowStart 14', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 5, 19),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.rowStart).toBe(14); // hourToRow(19) = 14
  });

  it('scheduledDate 21:00 (야간 이후) → rowStart 14 (야간 상한)', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 5, 21),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.rowStart).toBe(14);
  });

  // ── 5. rowSpan 계산 ─────────────────────────────────────────────────

  it('scheduledDate 14:00, dueDate 16:00 → rowSpan 3 (14:00~16:00 포함)', () => {
    // rowStart = hourToRow(14) = 9, dueRow = hourToRow(16) = 11
    // span = 11 - 9 + 1 = 3
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 3, 14),
      dueDate: localDatetime(2026, 3, 3, 16),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.rowSpan).toBe(3);
  });

  it('scheduledDate 09:00, dueDate 11:00 → rowSpan 3', () => {
    // rowStart = hourToRow(9) = 4, dueRow = hourToRow(11) = 6
    // span = 6 - 4 + 1 = 3
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 3, 9),
      dueDate: localDatetime(2026, 3, 3, 11),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.rowSpan).toBe(3);
  });

  it('dueDate가 다른 날이면 rowSpan = 1', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 3, 14),
      dueDate: localDatetime(2026, 3, 4, 16), // 다음 날
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.rowSpan).toBe(1);
  });

  it('dueDate가 없으면 rowSpan = 1', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 3, 14),
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.rowSpan).toBe(1);
  });

  // ── 6. 이번 주 밖 → col 8 (예정업무) ──────────────────────────────

  it('scheduledDate가 이번 주 이전 → col 8 (예정업무)', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 2, 28, 14), // 2026-02-28 (저번 주 토)
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.col).toBe(8);
  });

  it('scheduledDate가 이번 주 이후 → col 8 (예정업무)', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 9, 14), // 2026-03-09 (다음 주 월)
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.col).toBe(8);
  });

  // ── 7. scheduledDate 없는 task → col 8 (예정업무) ──────────────────

  it('scheduledDate 없는 BEFORE_START task → col 8 (예정업무)', () => {
    const task = makeTask({
      scheduledDate: undefined,
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.col).toBe(8);
  });

  it('scheduledDate 없는 COMPLETED task (completedAt이 이번 주) → 이번 주 col', () => {
    const task = makeTask({
      scheduledDate: undefined,
      taskStatus: {
        id: 'status-done',
        name: '완료',
        category: 'COMPLETED',
        color: '#27AE60',
        sortOrder: 2,
      },
      completedAt: localDatetime(2026, 3, 4, 15), // 수요일 15:00
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    // 수요일 = dayIndex 3 → col 4
    expect(result.col).toBe(4);
    expect(result.rowStart).toBe(1); // 시간이 있어도 종일 행으로 배치 (completedAt fallback)
  });

  it('scheduledDate 없는 COMPLETED task (completedAt이 이번 주 밖) → col 8', () => {
    const task = makeTask({
      scheduledDate: undefined,
      taskStatus: {
        id: 'status-done',
        name: '완료',
        category: 'COMPLETED',
        color: '#27AE60',
        sortOrder: 2,
      },
      completedAt: localDatetime(2026, 2, 28, 15), // 저번 주
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.col).toBe(8);
  });

  // ── 8. 일요일(col 1)과 토요일(col 7) 경계 ─────────────────────────

  it('이번 주 일요일 scheduledDate → col 1', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 1, 10), // 일요일
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.col).toBe(1);
  });

  it('이번 주 토요일 scheduledDate → col 7', () => {
    const task = makeTask({
      scheduledDate: localDatetime(2026, 3, 7, 10), // 토요일
    });

    const result = taskToCell(task, SUNDAY, SATURDAY);

    expect(result.col).toBe(7);
  });
});

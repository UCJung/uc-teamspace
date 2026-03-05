import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ForbiddenException, HttpStatus } from '@nestjs/common';
import { TaskStatusCategory, TaskPriority } from '@prisma/client';
import { PersonalTaskService } from './personal-task.service';
import { BusinessException } from '../common/filters/business-exception';

// ── Prisma mock ─────────────────────────────────────────────────────────────

const mockTx = {
  weeklyReport: {
    findUnique: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve({ id: 'wr-1' })),
  },
  workItem: {
    findFirst: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve({ id: 'wi-1' })),
  },
  personalTask: {
    findFirst: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
    create: mock(() => Promise.resolve({ id: 'pt-1' })),
    update: mock(() => Promise.resolve({ id: 'pt-1' })),
    updateMany: mock(() => Promise.resolve({ count: 1 })),
    aggregate: mock(() => Promise.resolve({ _max: { sortOrder: null } })),
  },
};

const mockPrisma = {
  personalTask: {
    findMany: mock(() => Promise.resolve([])),
    findFirst: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve({ id: 'pt-1' })),
    update: mock(() => Promise.resolve({ id: 'pt-1' })),
    updateMany: mock(() => Promise.resolve({ count: 1 })),
    count: mock(() => Promise.resolve(0)),
    aggregate: mock(() => Promise.resolve({ _max: { sortOrder: null } })),
  },
  taskStatusDef: {
    findMany: mock(() => Promise.resolve([])),
    findFirst: mock(() => Promise.resolve(null)),
    findUnique: mock(() => Promise.resolve(null)),
  },
  teamMembership: {
    findUnique: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
  },
  weeklyReport: {
    findUnique: mock(() => Promise.resolve(null)),
  },
  $transaction: mock((fn: unknown) => {
    if (typeof fn === 'function') {
      return fn(mockTx);
    }
    return Promise.all(fn as Promise<unknown>[]);
  }),
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function resetMocks() {
  mockPrisma.personalTask.findMany.mockReset();
  mockPrisma.personalTask.findFirst.mockReset();
  mockPrisma.personalTask.create.mockReset();
  mockPrisma.personalTask.update.mockReset();
  mockPrisma.personalTask.updateMany.mockReset();
  mockPrisma.personalTask.count.mockReset();
  mockPrisma.personalTask.aggregate.mockReset();
  mockPrisma.taskStatusDef.findMany.mockReset();
  mockPrisma.taskStatusDef.findFirst.mockReset();
  mockPrisma.taskStatusDef.findUnique.mockReset();
  mockPrisma.teamMembership.findUnique.mockReset();
  mockPrisma.teamMembership.findMany.mockReset();
  mockPrisma.weeklyReport.findUnique.mockReset();
  mockPrisma.$transaction.mockReset();

  mockTx.weeklyReport.findUnique.mockReset();
  mockTx.weeklyReport.create.mockReset();
  mockTx.workItem.findFirst.mockReset();
  mockTx.workItem.create.mockReset();
  mockTx.personalTask.findFirst.mockReset();
  mockTx.personalTask.findMany.mockReset();
  mockTx.personalTask.create.mockReset();
  mockTx.personalTask.update.mockReset();
  mockTx.personalTask.updateMany.mockReset();
  mockTx.personalTask.aggregate.mockReset();

  // 기본 $transaction 복원
  mockPrisma.$transaction.mockImplementation((fn: unknown) => {
    if (typeof fn === 'function') {
      return fn(mockTx);
    }
    return Promise.all(fn as Promise<unknown>[]);
  });
}

function makeTask(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pt-1',
    memberId: 'member-1',
    teamId: 'team-1',
    title: '테스트 작업',
    memo: null,
    projectId: null,
    priority: TaskPriority.MEDIUM,
    statusId: 'status-1',
    dueDate: null,
    startedAt: null,
    completedAt: null,
    elapsedMinutes: null,
    sortOrder: 0,
    isDeleted: false,
    linkedWeekLabel: null,
    repeatConfig: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('PersonalTaskService', () => {
  let service: PersonalTaskService;

  beforeEach(() => {
    service = new PersonalTaskService(mockPrisma as never);
    resetMocks();
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('statusId 미입력 시 팀의 BEFORE_START isDefault 상태를 자동 배정한다', async () => {
      const defaultStatus = { id: 'default-status-id' };
      mockPrisma.taskStatusDef.findFirst.mockResolvedValueOnce(defaultStatus as never);
      mockPrisma.personalTask.aggregate.mockResolvedValueOnce({ _max: { sortOrder: null } } as never);

      const createdTask = {
        ...makeTask({ statusId: 'default-status-id' }),
        taskStatus: { id: 'default-status-id', name: '할일', color: '#ccc', category: TaskStatusCategory.BEFORE_START, sortOrder: 0 },
        project: null,
      };
      mockPrisma.personalTask.create.mockResolvedValueOnce(createdTask as never);

      const result = await service.create('member-1', {
        title: '새 작업',
        teamId: 'team-1',
      });

      // BEFORE_START isDefault 상태 조회가 호출되었는지 확인
      expect(mockPrisma.taskStatusDef.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teamId: 'team-1',
            category: TaskStatusCategory.BEFORE_START,
            isDefault: true,
          }),
        }),
      );

      // create 시 자동 배정된 statusId 사용 확인
      const createCall = mockPrisma.personalTask.create.mock.calls[0][0] as { data: { statusId: string } };
      expect(createCall.data.statusId).toBe('default-status-id');
      expect(result.statusId).toBe('default-status-id');
    });

    it('statusId 미입력 + 기본 상태 없음 시 TASK_STATUS_NOT_FOUND 예외 발생', async () => {
      mockPrisma.taskStatusDef.findFirst.mockResolvedValueOnce(null);

      try {
        await service.create('member-1', { title: '작업', teamId: 'team-1' });
        expect(true).toBe(false); // 이 라인에 도달하면 안 됨
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TASK_STATUS_NOT_FOUND');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('dueDate에 시간 포함 ISO datetime 문자열을 입력하면 Date 객체로 변환하여 저장한다', async () => {
      const defaultStatus = { id: 'default-status-id' };
      mockPrisma.taskStatusDef.findFirst.mockResolvedValueOnce(defaultStatus as never);
      mockPrisma.personalTask.aggregate.mockResolvedValueOnce({ _max: { sortOrder: null } } as never);

      const dueDatetimeStr = '2026-03-05T14:00:00.000Z';
      const expectedDate = new Date(dueDatetimeStr);

      const createdTask = {
        ...makeTask({ statusId: 'default-status-id', dueDate: expectedDate }),
        taskStatus: { id: 'default-status-id', name: '할일', color: '#ccc', category: TaskStatusCategory.BEFORE_START, sortOrder: 0 },
        project: null,
      };
      mockPrisma.personalTask.create.mockResolvedValueOnce(createdTask as never);

      await service.create('member-1', {
        title: '시간 포함 작업',
        teamId: 'team-1',
        dueDate: dueDatetimeStr,
      });

      const createCall = mockPrisma.personalTask.create.mock.calls[0][0] as {
        data: { dueDate?: Date; scheduledDate?: Date };
      };
      // dueDate가 Date 객체로 변환되어 전달되어야 함
      expect(createCall.data.dueDate).toBeInstanceOf(Date);
      expect(createCall.data.dueDate?.getTime()).toBe(expectedDate.getTime());
    });

    it('dueDate에 날짜만(YYYY-MM-DD) 입력하면 Date 객체로 변환하여 저장한다', async () => {
      const defaultStatus = { id: 'default-status-id' };
      mockPrisma.taskStatusDef.findFirst.mockResolvedValueOnce(defaultStatus as never);
      mockPrisma.personalTask.aggregate.mockResolvedValueOnce({ _max: { sortOrder: null } } as never);

      const dueDateStr = '2026-03-05';
      const expectedDate = new Date(dueDateStr);

      const createdTask = {
        ...makeTask({ statusId: 'default-status-id', dueDate: expectedDate }),
        taskStatus: { id: 'default-status-id', name: '할일', color: '#ccc', category: TaskStatusCategory.BEFORE_START, sortOrder: 0 },
        project: null,
      };
      mockPrisma.personalTask.create.mockResolvedValueOnce(createdTask as never);

      await service.create('member-1', {
        title: '날짜만 포함 작업',
        teamId: 'team-1',
        dueDate: dueDateStr,
      });

      const createCall = mockPrisma.personalTask.create.mock.calls[0][0] as {
        data: { dueDate?: Date };
      };
      // dueDate가 Date 객체로 변환되어 전달되어야 함
      expect(createCall.data.dueDate).toBeInstanceOf(Date);
      expect(createCall.data.dueDate?.getTime()).toBe(expectedDate.getTime());
    });

    it('scheduledDate에 시간 포함 ISO datetime 문자열을 입력하면 Date 객체로 변환하여 저장한다', async () => {
      const defaultStatus = { id: 'default-status-id' };
      mockPrisma.taskStatusDef.findFirst.mockResolvedValueOnce(defaultStatus as never);
      mockPrisma.personalTask.aggregate.mockResolvedValueOnce({ _max: { sortOrder: null } } as never);

      const scheduledDatetimeStr = '2026-03-06T09:30:00.000Z';
      const expectedDate = new Date(scheduledDatetimeStr);

      const createdTask = {
        ...makeTask({ statusId: 'default-status-id', scheduledDate: expectedDate }),
        taskStatus: { id: 'default-status-id', name: '할일', color: '#ccc', category: TaskStatusCategory.BEFORE_START, sortOrder: 0 },
        project: null,
      };
      mockPrisma.personalTask.create.mockResolvedValueOnce(createdTask as never);

      await service.create('member-1', {
        title: '예정 시간 포함 작업',
        teamId: 'team-1',
        scheduledDate: scheduledDatetimeStr,
      });

      const createCall = mockPrisma.personalTask.create.mock.calls[0][0] as {
        data: { scheduledDate?: Date };
      };
      expect(createCall.data.scheduledDate).toBeInstanceOf(Date);
      expect(createCall.data.scheduledDate?.getTime()).toBe(expectedDate.getTime());
    });

    it('statusId 직접 입력 시 기본 상태 조회 없이 그대로 사용한다', async () => {
      mockPrisma.personalTask.aggregate.mockResolvedValueOnce({ _max: { sortOrder: 5 } } as never);

      const createdTask = {
        ...makeTask({ statusId: 'custom-status-id', sortOrder: 6 }),
        taskStatus: { id: 'custom-status-id', name: '검토중', color: '#aaa', category: TaskStatusCategory.IN_PROGRESS, sortOrder: 1 },
        project: null,
      };
      mockPrisma.personalTask.create.mockResolvedValueOnce(createdTask as never);

      await service.create('member-1', {
        title: '새 작업',
        teamId: 'team-1',
        statusId: 'custom-status-id',
      });

      // findFirst(기본 상태 조회)는 호출되지 않아야 함
      expect(mockPrisma.taskStatusDef.findFirst).not.toHaveBeenCalled();

      const createCall = mockPrisma.personalTask.create.mock.calls[0][0] as { data: { statusId: string; sortOrder: number } };
      expect(createCall.data.statusId).toBe('custom-status-id');
      expect(createCall.data.sortOrder).toBe(6); // maxSortOrder(5) + 1
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('COMPLETED category로 statusId 변경 시 completedAt이 자동 설정된다', async () => {
      const existingTask = makeTask({ statusId: 'status-in-progress', startedAt: new Date(Date.now() - 60000) });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(existingTask as never);

      const completedStatusDef = { category: TaskStatusCategory.COMPLETED };
      mockPrisma.taskStatusDef.findUnique.mockResolvedValueOnce(completedStatusDef as never);

      const updatedTask = {
        ...existingTask,
        statusId: 'status-completed',
        completedAt: new Date(),
        elapsedMinutes: 1,
        taskStatus: { id: 'status-completed', name: '완료', color: '#green', category: TaskStatusCategory.COMPLETED, sortOrder: 2 },
        project: null,
      };
      mockPrisma.personalTask.update.mockResolvedValueOnce(updatedTask as never);

      const result = await service.update('pt-1', 'member-1', { statusId: 'status-completed' });

      // update 호출 시 completedAt이 포함되었는지 확인
      const updateCall = mockPrisma.personalTask.update.mock.calls[0][0] as { data: { completedAt?: Date; statusId: string } };
      expect(updateCall.data.completedAt).toBeDefined();
      expect(updateCall.data.statusId).toBe('status-completed');
      expect(result.completedAt).toBeDefined();
    });

    it('IN_PROGRESS category로 statusId 변경 + startedAt=null 이면 startedAt이 자동 설정된다', async () => {
      const existingTask = makeTask({ statusId: 'status-todo', startedAt: null });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(existingTask as never);

      const inProgressStatusDef = { category: TaskStatusCategory.IN_PROGRESS };
      mockPrisma.taskStatusDef.findUnique.mockResolvedValueOnce(inProgressStatusDef as never);

      mockPrisma.personalTask.update.mockResolvedValueOnce({
        ...existingTask,
        statusId: 'status-in-progress',
        startedAt: new Date(),
        taskStatus: { id: 'status-in-progress', name: '진행중', color: '#blue', category: TaskStatusCategory.IN_PROGRESS, sortOrder: 1 },
        project: null,
      } as never);

      await service.update('pt-1', 'member-1', { statusId: 'status-in-progress' });

      const updateCall = mockPrisma.personalTask.update.mock.calls[0][0] as { data: { startedAt?: Date } };
      expect(updateCall.data.startedAt).toBeDefined();
    });

    it('COMPLETED → COMPLETED (같은 상태) 변경 시 statusId가 이미 동일하면 카테고리 조회 없이 처리', async () => {
      const existingTask = makeTask({ statusId: 'status-completed' });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(existingTask as never);

      mockPrisma.personalTask.update.mockResolvedValueOnce({
        ...existingTask,
        title: '수정된 제목',
        taskStatus: { id: 'status-completed', name: '완료', color: '#green', category: TaskStatusCategory.COMPLETED, sortOrder: 2 },
        project: null,
      } as never);

      await service.update('pt-1', 'member-1', {
        statusId: 'status-completed', // 동일한 statusId
        title: '수정된 제목',
      });

      // statusId가 동일하면 findUnique(카테고리 조회) 없이 update만 호출
      expect(mockPrisma.taskStatusDef.findUnique).not.toHaveBeenCalled();
    });

    it('update 시 dueDate에 시간 포함 datetime을 입력하면 Date 객체로 변환한다', async () => {
      const existingTask = makeTask({ statusId: 'status-todo' });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(existingTask as never);

      const dueDatetimeStr = '2026-03-10T18:00:00.000Z';
      const expectedDate = new Date(dueDatetimeStr);

      const updatedTask = {
        ...existingTask,
        dueDate: expectedDate,
        taskStatus: { id: 'status-todo', name: '할일', color: '#ccc', category: TaskStatusCategory.BEFORE_START, sortOrder: 0 },
        project: null,
      };
      mockPrisma.personalTask.update.mockResolvedValueOnce(updatedTask as never);

      await service.update('pt-1', 'member-1', { dueDate: dueDatetimeStr });

      const updateCall = mockPrisma.personalTask.update.mock.calls[0][0] as {
        data: { dueDate?: Date };
      };
      expect(updateCall.data.dueDate).toBeInstanceOf(Date);
      expect(updateCall.data.dueDate?.getTime()).toBe(expectedDate.getTime());
    });

    it('update 시 scheduledDate를 null로 보내면 null로 저장된다', async () => {
      const existingTask = makeTask({
        statusId: 'status-todo',
        scheduledDate: new Date('2026-03-06T09:00:00.000Z'),
      });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(existingTask as never);

      const updatedTask = {
        ...existingTask,
        scheduledDate: null,
        taskStatus: { id: 'status-todo', name: '할일', color: '#ccc', category: TaskStatusCategory.BEFORE_START, sortOrder: 0 },
        project: null,
      };
      mockPrisma.personalTask.update.mockResolvedValueOnce(updatedTask as never);

      await service.update('pt-1', 'member-1', { scheduledDate: '' });

      const updateCall = mockPrisma.personalTask.update.mock.calls[0][0] as {
        data: { scheduledDate?: Date | null };
      };
      // 빈 문자열은 falsy이므로 null로 처리
      expect(updateCall.data.scheduledDate).toBeNull();
    });

    it('본인 작업이 아닌 경우 ForbiddenException 발생', async () => {
      const otherMemberTask = makeTask({ memberId: 'other-member' });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(otherMemberTask as never);

      try {
        await service.update('pt-1', 'member-1', { title: '수정' });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  // ── toggleDone ──────────────────────────────────────────────────────────────

  describe('toggleDone', () => {
    it('COMPLETED → BEFORE_START isDefault로 전환하고 completedAt을 null로 설정한다', async () => {
      const completedTask = makeTask({
        statusId: 'status-done',
        completedAt: new Date(),
      });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(completedTask as never);

      // 현재 상태가 COMPLETED
      mockPrisma.taskStatusDef.findUnique.mockResolvedValueOnce({
        category: TaskStatusCategory.COMPLETED,
        teamId: 'team-1',
      } as never);

      // BEFORE_START 기본 상태 조회
      mockPrisma.taskStatusDef.findFirst.mockResolvedValueOnce({ id: 'status-todo' } as never);

      mockPrisma.personalTask.update.mockResolvedValueOnce({
        ...completedTask,
        statusId: 'status-todo',
        completedAt: null,
        taskStatus: { id: 'status-todo', name: '할일', color: '#gray', category: TaskStatusCategory.BEFORE_START, sortOrder: 0 },
        project: null,
      } as never);

      const result = await service.toggleDone('pt-1', 'member-1');

      const updateCall = mockPrisma.personalTask.update.mock.calls[0][0] as {
        data: { statusId: string; completedAt: null };
      };
      expect(updateCall.data.statusId).toBe('status-todo');
      expect(updateCall.data.completedAt).toBeNull();
      expect(result.statusId).toBe('status-todo');
    });

    it('BEFORE_START → COMPLETED isDefault로 전환하고 completedAt을 설정한다', async () => {
      const todoTask = makeTask({ statusId: 'status-todo' });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(todoTask as never);

      // 현재 상태가 BEFORE_START (not COMPLETED)
      mockPrisma.taskStatusDef.findUnique.mockResolvedValueOnce({
        category: TaskStatusCategory.BEFORE_START,
        teamId: 'team-1',
      } as never);

      // COMPLETED 기본 상태 조회
      mockPrisma.taskStatusDef.findFirst.mockResolvedValueOnce({ id: 'status-done' } as never);

      mockPrisma.personalTask.update.mockResolvedValueOnce({
        ...todoTask,
        statusId: 'status-done',
        completedAt: new Date(),
        taskStatus: { id: 'status-done', name: '완료', color: '#green', category: TaskStatusCategory.COMPLETED, sortOrder: 2 },
        project: null,
      } as never);

      const result = await service.toggleDone('pt-1', 'member-1');

      const updateCall = mockPrisma.personalTask.update.mock.calls[0][0] as {
        data: { statusId: string; completedAt: Date };
      };
      expect(updateCall.data.statusId).toBe('status-done');
      expect(updateCall.data.completedAt).toBeDefined();
      expect(result.completedAt).toBeDefined();
    });

    it('startedAt이 있으면 toggleDone 시 elapsedMinutes가 자동 계산된다', async () => {
      const startedAt = new Date(Date.now() - 5 * 60 * 1000); // 5분 전
      const inProgressTask = makeTask({ statusId: 'status-in-progress', startedAt });
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(inProgressTask as never);

      mockPrisma.taskStatusDef.findUnique.mockResolvedValueOnce({
        category: TaskStatusCategory.IN_PROGRESS,
        teamId: 'team-1',
      } as never);

      mockPrisma.taskStatusDef.findFirst.mockResolvedValueOnce({ id: 'status-done' } as never);

      mockPrisma.personalTask.update.mockResolvedValueOnce({
        ...inProgressTask,
        statusId: 'status-done',
        completedAt: new Date(),
        elapsedMinutes: 5,
        taskStatus: { id: 'status-done', name: '완료', color: '#green', category: TaskStatusCategory.COMPLETED, sortOrder: 2 },
        project: null,
      } as never);

      await service.toggleDone('pt-1', 'member-1');

      const updateCall = mockPrisma.personalTask.update.mock.calls[0][0] as {
        data: { elapsedMinutes?: number };
      };
      // elapsedMinutes가 양수여야 함 (약 5분)
      expect(updateCall.data.elapsedMinutes).toBeGreaterThanOrEqual(0);
    });
  });

  // ── getPartOverview ─────────────────────────────────────────────────────────

  describe('getPartOverview', () => {
    it('파트장이 아니면 ForbiddenException 발생', async () => {
      mockPrisma.teamMembership.findUnique.mockResolvedValueOnce({
        memberId: 'member-1',
        teamId: 'team-1',
        partId: 'part-1',
        roles: ['MEMBER'],
      } as never);

      try {
        await service.getPartOverview('member-1', 'team-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('팀 소속이 없으면 ForbiddenException 발생', async () => {
      mockPrisma.teamMembership.findUnique.mockResolvedValueOnce(null);

      try {
        await service.getPartOverview('member-1', 'team-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('BEFORE_START/IN_PROGRESS/COMPLETED 카테고리 기반으로 카운트를 반환한다', async () => {
      mockPrisma.teamMembership.findUnique.mockResolvedValueOnce({
        memberId: 'member-1',
        teamId: 'team-1',
        partId: 'part-1',
        roles: ['PART_LEADER'],
      } as never);

      mockPrisma.teamMembership.findMany.mockResolvedValueOnce([
        {
          memberId: 'member-2',
          teamId: 'team-1',
          partId: 'part-1',
          member: { id: 'member-2', name: '홍길동' },
        },
      ] as never);

      // 카테고리별 status id 목록 조회 (3회)
      mockPrisma.taskStatusDef.findMany
        .mockResolvedValueOnce([{ id: 'status-todo' }] as never)   // BEFORE_START
        .mockResolvedValueOnce([{ id: 'status-ip' }] as never)     // IN_PROGRESS
        .mockResolvedValueOnce([{ id: 'status-done' }] as never);  // COMPLETED

      // 각 멤버의 카운트 (3회)
      mockPrisma.personalTask.count
        .mockResolvedValueOnce(3)  // todoCount
        .mockResolvedValueOnce(1)  // inProgressCount
        .mockResolvedValueOnce(5); // doneCount

      const result = await service.getPartOverview('member-1', 'team-1', 'part-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        memberId: 'member-2',
        memberName: '홍길동',
        todoCount: 3,
        inProgressCount: 1,
        doneCount: 5,
      });
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('category 필터가 있으면 해당 카테고리 statusId 목록으로 변환한다', async () => {
      // createRecurringTasksIfNeeded 내부 findMany 처리
      mockPrisma.personalTask.findMany
        .mockResolvedValueOnce([]) // recurring tasks
        .mockResolvedValueOnce([]); // findAll result

      mockPrisma.taskStatusDef.findMany.mockResolvedValueOnce([
        { id: 'status-todo-1' },
        { id: 'status-todo-2' },
      ] as never);

      await service.findAll('member-1', {
        teamId: 'team-1',
        category: TaskStatusCategory.BEFORE_START,
      });

      // getStatusIdsByCategory 호출 확인
      expect(mockPrisma.taskStatusDef.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teamId: 'team-1',
            category: TaskStatusCategory.BEFORE_START,
          }),
        }),
      );

      // findMany 두 번째 호출(personalTask)에서 statusId in 조건 확인
      const ptFindCall = mockPrisma.personalTask.findMany.mock.calls[1][0] as {
        where: { statusId?: { in: string[] } };
      };
      expect(ptFindCall.where.statusId).toEqual({ in: ['status-todo-1', 'status-todo-2'] });
    });

    it('statusId 필터가 있으면 category 필터보다 우선한다', async () => {
      mockPrisma.personalTask.findMany
        .mockResolvedValueOnce([]) // recurring tasks
        .mockResolvedValueOnce([]); // findAll result

      await service.findAll('member-1', {
        teamId: 'team-1',
        statusId: 'specific-status-id',
        category: TaskStatusCategory.BEFORE_START,
      });

      // category를 위한 taskStatusDef.findMany는 호출되지 않아야 함
      expect(mockPrisma.taskStatusDef.findMany).not.toHaveBeenCalled();

      const ptFindCall = mockPrisma.personalTask.findMany.mock.calls[1][0] as {
        where: { statusId?: string };
      };
      expect(ptFindCall.where.statusId).toBe('specific-status-id');
    });
  });

  // ── softDelete ──────────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('본인 작업이면 isDeleted=true로 소프트 삭제한다', async () => {
      const ownTask = makeTask();
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(ownTask as never);
      mockPrisma.personalTask.update.mockResolvedValueOnce({ id: 'pt-1' } as never);

      const result = await service.softDelete('pt-1', 'member-1');

      const updateCall = mockPrisma.personalTask.update.mock.calls[0][0] as {
        data: { isDeleted: boolean };
      };
      expect(updateCall.data.isDeleted).toBe(true);
      expect(result).toEqual({ id: 'pt-1' });
    });

    it('존재하지 않는 작업이면 PERSONAL_TASK_NOT_FOUND 예외 발생', async () => {
      mockPrisma.personalTask.findFirst.mockResolvedValueOnce(null);

      try {
        await service.softDelete('nonexistent', 'member-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('PERSONAL_TASK_NOT_FOUND');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});

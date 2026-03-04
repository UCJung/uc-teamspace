import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { HttpStatus } from '@nestjs/common';
import { ApprovalType, TimesheetStatus } from '@prisma/client';
import { TimesheetApprovalService } from './timesheet-approval.service';
import { BusinessException } from '../common/filters/business-exception';

// ─── Shared mock data ─────────────────────────────────────────────────────────

const makeMockTimesheet = (overrides: Partial<{
  id: string;
  status: TimesheetStatus;
  approvals: unknown[];
}> = {}) => ({
  id: overrides.id ?? 'ts-1',
  memberId: 'member-1',
  teamId: 'team-1',
  yearMonth: '2026-03',
  status: overrides.status ?? TimesheetStatus.SUBMITTED,
  submittedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  member: { id: 'member-1', name: '홍길동' },
  approvals: overrides.approvals ?? [],
});

const mockApproval = {
  id: 'approval-1',
  timesheetId: 'ts-1',
  approverId: 'leader-1',
  approvalType: ApprovalType.LEADER,
  status: TimesheetStatus.APPROVED,
  comment: null,
  approvedAt: new Date(),
  autoApproved: false,
  approver: { id: 'leader-1', name: '팀장' },
};

// ─── Prisma mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  monthlyTimesheet: {
    findUnique: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
    update: mock(() => Promise.resolve({})),
  },
  timesheetApproval: {
    create: mock(() => Promise.resolve(mockApproval)),
    update: mock(() => Promise.resolve({})),
    delete: mock(() => Promise.resolve({})),
  },
  project: {
    findUnique: mock(() => Promise.resolve(null)),
  },
  member: {
    findUnique: mock(() => Promise.resolve(null)),
  },
  $transaction: mock(async (arg: unknown) => {
    if (typeof arg === 'function') return arg(mockPrisma);
    if (Array.isArray(arg)) return Promise.all(arg);
    return null;
  }),
};

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('TimesheetApprovalService', () => {
  let service: TimesheetApprovalService;

  beforeEach(() => {
    service = new TimesheetApprovalService(mockPrisma as never);

    mockPrisma.monthlyTimesheet.findUnique.mockReset();
    mockPrisma.monthlyTimesheet.findMany.mockReset();
    mockPrisma.monthlyTimesheet.update.mockReset();
    mockPrisma.timesheetApproval.create.mockReset();
    mockPrisma.timesheetApproval.update.mockReset();
    mockPrisma.timesheetApproval.delete.mockReset();
    mockPrisma.project.findUnique.mockReset();
    mockPrisma.member.findUnique.mockReset();
    mockPrisma.$transaction.mockReset();

    // Restore $transaction default
    mockPrisma.$transaction.mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(mockPrisma);
      if (Array.isArray(arg)) return Promise.all(arg);
      return null;
    });
  });

  // ─── leaderApprove ───────────────────────────────────────────────────────

  describe('leaderApprove', () => {
    it('should throw TIMESHEET_NOT_FOUND when timesheet does not exist', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(null);

      try {
        await service.leaderApprove('nonexistent', 'leader-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_NOT_FOUND');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw TIMESHEET_NOT_SUBMITTED when timesheet is DRAFT', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(
        makeMockTimesheet({ status: TimesheetStatus.DRAFT }),
      );

      try {
        await service.leaderApprove('ts-1', 'leader-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_NOT_SUBMITTED');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should approve SUBMITTED timesheet and return approval record', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(
        makeMockTimesheet({ status: TimesheetStatus.SUBMITTED }),
      );

      mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
        const txPrisma = {
          ...mockPrisma,
          timesheetApproval: {
            ...mockPrisma.timesheetApproval,
            create: mock(() => Promise.resolve(mockApproval)),
          },
          monthlyTimesheet: {
            ...mockPrisma.monthlyTimesheet,
            update: mock(() => Promise.resolve({})),
          },
        };
        return fn(txPrisma);
      });

      const result = await service.leaderApprove('ts-1', 'leader-1');
      expect(result).toBeDefined();
      expect(result.approvalType).toBe(ApprovalType.LEADER);
      expect(result.status).toBe(TimesheetStatus.APPROVED);
    });

    it('should delete existing LEADER approval before creating new one', async () => {
      const existingApproval = {
        id: 'old-approval',
        approvalType: ApprovalType.LEADER,
        status: TimesheetStatus.APPROVED,
      };
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(
        makeMockTimesheet({ status: TimesheetStatus.SUBMITTED, approvals: [existingApproval] }),
      );

      mockPrisma.timesheetApproval.delete.mockResolvedValueOnce({});
      mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
        const txPrisma = {
          ...mockPrisma,
          timesheetApproval: {
            ...mockPrisma.timesheetApproval,
            create: mock(() => Promise.resolve(mockApproval)),
          },
          monthlyTimesheet: {
            ...mockPrisma.monthlyTimesheet,
            update: mock(() => Promise.resolve({})),
          },
        };
        return fn(txPrisma);
      });

      await service.leaderApprove('ts-1', 'leader-1');
      expect(mockPrisma.timesheetApproval.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'old-approval' } }),
      );
    });
  });

  // ─── leaderReject ────────────────────────────────────────────────────────

  describe('leaderReject', () => {
    it('should throw REJECT_COMMENT_REQUIRED when comment is empty', async () => {
      try {
        await service.leaderReject('ts-1', 'leader-1', '');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('REJECT_COMMENT_REQUIRED');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw REJECT_COMMENT_REQUIRED when comment is whitespace only', async () => {
      try {
        await service.leaderReject('ts-1', 'leader-1', '   ');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('REJECT_COMMENT_REQUIRED');
      }
    });

    it('should throw TIMESHEET_NOT_SUBMITTED when timesheet is not SUBMITTED', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(
        makeMockTimesheet({ status: TimesheetStatus.DRAFT }),
      );

      try {
        await service.leaderReject('ts-1', 'leader-1', '반려 사유');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_NOT_SUBMITTED');
      }
    });

    it('should reject timesheet with comment and set REJECTED status', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(
        makeMockTimesheet({ status: TimesheetStatus.SUBMITTED }),
      );

      const rejectedApproval = {
        ...mockApproval,
        status: TimesheetStatus.REJECTED,
        comment: '수정 필요',
      };
      mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
        const txPrisma = {
          ...mockPrisma,
          timesheetApproval: {
            ...mockPrisma.timesheetApproval,
            create: mock(() => Promise.resolve(rejectedApproval)),
          },
          monthlyTimesheet: {
            ...mockPrisma.monthlyTimesheet,
            update: mock(() => Promise.resolve({})),
          },
        };
        return fn(txPrisma);
      });

      const result = await service.leaderReject('ts-1', 'leader-1', '수정 필요');
      expect(result.status).toBe(TimesheetStatus.REJECTED);
      expect(result.comment).toBe('수정 필요');
    });
  });

  // ─── batchLeaderApprove ───────────────────────────────────────────────────

  describe('batchLeaderApprove', () => {
    it('should throw INVALID_INPUT when timesheetIds is empty', async () => {
      try {
        await service.batchLeaderApprove([], 'leader-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('INVALID_INPUT');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw NO_SUBMITTED_TIMESHEETS when no SUBMITTED timesheets found', async () => {
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([]);

      try {
        await service.batchLeaderApprove(['ts-draft'], 'leader-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('NO_SUBMITTED_TIMESHEETS');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should approve all SUBMITTED timesheets in batch', async () => {
      const ts1 = makeMockTimesheet({ id: 'ts-1', status: TimesheetStatus.SUBMITTED });
      const ts2 = makeMockTimesheet({ id: 'ts-2', status: TimesheetStatus.SUBMITTED });
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([ts1, ts2]);

      mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
        const txPrisma = {
          ...mockPrisma,
          timesheetApproval: {
            ...mockPrisma.timesheetApproval,
            create: mock(() => Promise.resolve({})),
          },
          monthlyTimesheet: {
            ...mockPrisma.monthlyTimesheet,
            update: mock(() => Promise.resolve({})),
          },
        };
        return fn(txPrisma);
      });

      const result = await service.batchLeaderApprove(['ts-1', 'ts-2'], 'leader-1');
      expect(result.approvedCount).toBe(2);
      expect(result.approvedIds).toContain('ts-1');
      expect(result.approvedIds).toContain('ts-2');
    });

    it('should only approve SUBMITTED timesheets (non-SUBMITTED are silently skipped by findMany filter)', async () => {
      // findMany filters by status: SUBMITTED — only ts-2 is returned
      const ts2 = makeMockTimesheet({ id: 'ts-2', status: TimesheetStatus.SUBMITTED });
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([ts2]);

      mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
        const txPrisma = {
          ...mockPrisma,
          timesheetApproval: {
            ...mockPrisma.timesheetApproval,
            create: mock(() => Promise.resolve({})),
          },
          monthlyTimesheet: {
            ...mockPrisma.monthlyTimesheet,
            update: mock(() => Promise.resolve({})),
          },
        };
        return fn(txPrisma);
      });

      const result = await service.batchLeaderApprove(['ts-1-draft', 'ts-2'], 'leader-1');
      expect(result.approvedCount).toBe(1);
      expect(result.approvedIds).toContain('ts-2');
    });
  });

  // ─── adminApprove ────────────────────────────────────────────────────────

  describe('adminApprove', () => {
    it('should return approved:0 when no APPROVED timesheets exist', async () => {
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([]);

      const result = await service.adminApprove('2026-03', 'admin-1');
      expect(result.approved).toBe(0);
    });

    it('should create ADMIN approval records in transaction', async () => {
      const leaderApproval = {
        id: 'la-1',
        approvalType: ApprovalType.LEADER,
        status: TimesheetStatus.APPROVED,
      };
      const ts = makeMockTimesheet({ id: 'ts-1', status: TimesheetStatus.APPROVED, approvals: [leaderApproval] });
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([ts]);

      const createMock = mock(() => Promise.resolve({ id: 'admin-approval-1' }));
      mockPrisma.$transaction.mockImplementationOnce(async (_arg: unknown) => {
        // adminApprove uses $transaction(ops) with array of promises
        // simulate array execution
        const result = await createMock();
        return [result];
      });

      const result = await service.adminApprove('2026-03', 'admin-1');
      expect(result.approved).toBe(1);
    });

    it('should skip timesheets that lack a LEADER approval', async () => {
      // ts-1 has no leader approval
      const ts1 = makeMockTimesheet({ id: 'ts-1', status: TimesheetStatus.APPROVED, approvals: [] });
      // ts-2 has leader approval
      const leaderApproval = {
        id: 'la-2',
        approvalType: ApprovalType.LEADER,
        status: TimesheetStatus.APPROVED,
      };
      const ts2 = makeMockTimesheet({ id: 'ts-2', status: TimesheetStatus.APPROVED, approvals: [leaderApproval] });
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([ts1, ts2]);

      mockPrisma.$transaction.mockImplementationOnce(async (_arg: unknown) => {
        return [{}];
      });

      const result = await service.adminApprove('2026-03', 'admin-1');
      expect(result.approved).toBe(1); // only ts-2 approved
      expect(result.errors).toHaveLength(1); // ts-1 skipped with error message
    });
  });
});

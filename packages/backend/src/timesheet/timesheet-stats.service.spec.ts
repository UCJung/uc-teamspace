import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { HttpStatus } from '@nestjs/common';
import { ApprovalType, TimesheetStatus } from '@prisma/client';
import { TimesheetStatsService } from './timesheet-stats.service';
import { BusinessException } from '../common/filters/business-exception';

// ─── Shared mock data ─────────────────────────────────────────────────────────

const mockMembership = (memberId: string, partName: string | null = 'DX파트') => ({
  memberId,
  teamId: 'team-1',
  sortOrder: 0,
  member: { id: memberId, name: `팀원-${memberId}`, position: '선임', jobTitle: '연구원' },
  part: partName ? { id: 'part-1', name: partName } : null,
});

const mockTimesheetEntry = (overrides: Partial<{ attendance: string; hours: number }> = {}) => ({
  id: 'entry-1',
  date: new Date('2026-03-03T00:00:00.000Z'),
  attendance: overrides.attendance ?? 'WORK',
  workLogs: overrides.hours !== undefined ? [{ id: 'wl-1', hours: overrides.hours, projectId: 'proj-1' }] : [],
});

const mockTimesheetBase = (memberId: string, overrides: Partial<{
  status: TimesheetStatus;
  approvals: unknown[];
  entries: unknown[];
}> = {}) => ({
  id: `ts-${memberId}`,
  memberId,
  teamId: 'team-1',
  yearMonth: '2026-03',
  status: overrides.status ?? TimesheetStatus.DRAFT,
  submittedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  entries: overrides.entries ?? [mockTimesheetEntry({ hours: 8 })],
  approvals: overrides.approvals ?? [],
});

// ─── Prisma mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  teamMembership: {
    findMany: mock(() => Promise.resolve([])),
  },
  monthlyTimesheet: {
    findMany: mock(() => Promise.resolve([])),
    findUnique: mock(() => Promise.resolve(null)),
  },
  timesheetEntry: {
    findMany: mock(() => Promise.resolve([])),
  },
  project: {
    findUnique: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
  },
  timesheetApproval: {
    findMany: mock(() => Promise.resolve([])),
    create: mock(() => Promise.resolve({})),
  },
  timesheetWorkLog: {
    findMany: mock(() => Promise.resolve([])),
  },
  team: {
    findMany: mock(() => Promise.resolve([])),
  },
  $transaction: mock(async (arg: unknown) => {
    if (typeof arg === 'function') return arg(mockPrisma);
    if (Array.isArray(arg)) return Promise.all(arg);
    return null;
  }),
};

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('TimesheetStatsService', () => {
  let service: TimesheetStatsService;

  beforeEach(() => {
    service = new TimesheetStatsService(mockPrisma as never);

    mockPrisma.teamMembership.findMany.mockReset();
    mockPrisma.monthlyTimesheet.findMany.mockReset();
    mockPrisma.monthlyTimesheet.findUnique.mockReset();
    mockPrisma.timesheetEntry.findMany.mockReset();
    mockPrisma.project.findUnique.mockReset();
    mockPrisma.project.findMany.mockReset();
    mockPrisma.timesheetApproval.findMany.mockReset();
    mockPrisma.timesheetApproval.create.mockReset();
    mockPrisma.timesheetWorkLog.findMany.mockReset();
    mockPrisma.team.findMany.mockReset();
    mockPrisma.$transaction.mockReset();

    mockPrisma.$transaction.mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(mockPrisma);
      if (Array.isArray(arg)) return Promise.all(arg);
      return null;
    });
  });

  // ─── getTeamMembersStatus ─────────────────────────────────────────────────

  describe('getTeamMembersStatus', () => {
    it('should return NOT_STARTED status for members with no timesheet', async () => {
      mockPrisma.teamMembership.findMany.mockResolvedValueOnce([
        mockMembership('member-1'),
        mockMembership('member-2'),
      ]);
      // No timesheets at all
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([]);

      const result = await service.getTeamMembersStatus('team-1', '2026-03');

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('NOT_STARTED');
      expect(result[0].timesheetId).toBeNull();
      expect(result[0].totalWorkHours).toBe(0);
      expect(result[0].workDays).toBe(0);
    });

    it('should return timesheet status for members with existing timesheet', async () => {
      mockPrisma.teamMembership.findMany.mockResolvedValueOnce([
        mockMembership('member-1'),
      ]);
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([
        mockTimesheetBase('member-1', {
          status: TimesheetStatus.SUBMITTED,
          entries: [mockTimesheetEntry({ attendance: 'WORK', hours: 8 })],
        }),
      ]);

      const result = await service.getTeamMembersStatus('team-1', '2026-03');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(TimesheetStatus.SUBMITTED);
      expect(result[0].timesheetId).toBe('ts-member-1');
      expect(result[0].totalWorkHours).toBe(8);
      expect(result[0].workDays).toBe(1);
    });

    it('should use findMany once (no N+1) for timesheet lookup', async () => {
      const memberships = ['member-1', 'member-2', 'member-3'].map((id) => mockMembership(id));
      mockPrisma.teamMembership.findMany.mockResolvedValueOnce(memberships);

      const timesheets = ['member-1', 'member-2', 'member-3'].map((id) =>
        mockTimesheetBase(id, { status: TimesheetStatus.DRAFT }),
      );
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce(timesheets);

      await service.getTeamMembersStatus('team-1', '2026-03');

      // monthlyTimesheet.findMany called exactly once (N+1 resolved)
      expect(mockPrisma.monthlyTimesheet.findMany).toHaveBeenCalledTimes(1);
    });

    it('should include leaderApproval and adminApproval data from approvals', async () => {
      const leaderApproval = {
        id: 'la-1',
        approvalType: ApprovalType.LEADER,
        status: TimesheetStatus.APPROVED,
        approvedAt: new Date(),
        comment: null,
        approver: { id: 'leader-1', name: '팀장' },
      };
      mockPrisma.teamMembership.findMany.mockResolvedValueOnce([mockMembership('member-1')]);
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([
        mockTimesheetBase('member-1', {
          status: TimesheetStatus.APPROVED,
          approvals: [leaderApproval],
        }),
      ]);

      const result = await service.getTeamMembersStatus('team-1', '2026-03');

      expect(result[0].leaderApproval).not.toBeNull();
      expect(result[0].leaderApproval?.status).toBe(TimesheetStatus.APPROVED);
      expect(result[0].adminApproval).toBeNull();
    });

    it('should correctly include part info from membership', async () => {
      mockPrisma.teamMembership.findMany.mockResolvedValueOnce([
        mockMembership('member-1', 'AX파트'),
      ]);
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([]);

      const result = await service.getTeamMembersStatus('team-1', '2026-03');

      expect(result[0].partName).toBe('AX파트');
    });

    it('should handle members with no part assignment', async () => {
      mockPrisma.teamMembership.findMany.mockResolvedValueOnce([
        mockMembership('member-1', null), // no part
      ]);
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([]);

      const result = await service.getTeamMembersStatus('team-1', '2026-03');

      expect(result[0].partId).toBeNull();
      expect(result[0].partName).toBeNull();
    });
  });

  // ─── getProjectAllocationMonthly ─────────────────────────────────────────

  describe('getProjectAllocationMonthly', () => {
    it('should throw PROJECT_NOT_FOUND when project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce(null);

      try {
        await service.getProjectAllocationMonthly('nonexistent', '2026-03', 'pm-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('PROJECT_NOT_FOUND');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return empty members list when no entries found', async () => {
      const mockProject = { id: 'proj-1', name: '테스트프로젝트', code: 'TP01', managerId: 'pm-1' };
      mockPrisma.project.findUnique.mockResolvedValueOnce(mockProject);

      // checkAndAutoApprove: monthlyTimesheet.findMany for auto-approve check (month not passed)
      // timesheetEntry.findMany: no entries
      mockPrisma.timesheetEntry.findMany.mockResolvedValueOnce([]);
      // B-2: second findMany for member timesheets
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([]);

      const result = await service.getProjectAllocationMonthly('proj-1', '2026-03', 'pm-1');

      expect(result.project.id).toBe('proj-1');
      expect(result.members).toHaveLength(0);
      expect(result.totalProjectHours).toBe(0);
    });

    it('should aggregate member hours correctly', async () => {
      const mockProject = { id: 'proj-1', name: '테스트프로젝트', code: 'TP01', managerId: 'pm-1' };
      mockPrisma.project.findUnique.mockResolvedValueOnce(mockProject);

      // Entries with project workLogs
      const entries = [
        {
          id: 'entry-1',
          timesheetId: 'ts-1',
          timesheet: {
            id: 'ts-1',
            member: { id: 'member-1', name: '홍길동', position: '선임' },
            approvals: [],
          },
          workLogs: [{ id: 'wl-1', hours: 4, projectId: 'proj-1' }],
        },
        {
          id: 'entry-2',
          timesheetId: 'ts-1',
          timesheet: {
            id: 'ts-1',
            member: { id: 'member-1', name: '홍길동', position: '선임' },
            approvals: [],
          },
          workLogs: [{ id: 'wl-2', hours: 4, projectId: 'proj-1' }],
        },
      ];
      mockPrisma.timesheetEntry.findMany.mockResolvedValueOnce(entries);

      // B-2: member timesheets for ratio calculation
      mockPrisma.monthlyTimesheet.findMany.mockResolvedValueOnce([
        {
          id: 'ts-1',
          memberId: 'member-1',
          entries: [
            { workLogs: [{ hours: 8 }] },
            { workLogs: [{ hours: 8 }] },
          ],
        },
      ]);

      const result = await service.getProjectAllocationMonthly('proj-1', '2026-03', 'pm-1');

      expect(result.members).toHaveLength(1);
      expect(result.members[0].memberId).toBe('member-1');
      expect(result.members[0].totalHours).toBe(8); // 4 + 4
      expect(result.totalProjectHours).toBe(8);
    });
  });
});

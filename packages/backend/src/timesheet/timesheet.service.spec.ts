import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { HttpStatus } from '@nestjs/common';
import { TimesheetStatus, AttendanceType } from '@prisma/client';
import { TimesheetService } from './timesheet.service';
import { BusinessException } from '../common/filters/business-exception';

// ─── Shared mock data ─────────────────────────────────────────────────────────

const mockTimesheetInclude = {
  entries: [],
  approvals: [],
  member: { id: 'member-1', name: '홍길동', position: null },
};

const mockTimesheet = {
  id: 'ts-1',
  memberId: 'member-1',
  teamId: 'team-1',
  yearMonth: '2026-03',
  status: TimesheetStatus.DRAFT,
  submittedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...mockTimesheetInclude,
};

// ─── Prisma mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  monthlyTimesheet: {
    findUnique: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve(mockTimesheet)),
    update: mock(() => Promise.resolve(mockTimesheet)),
  },
  timesheetWorkLog: {
    deleteMany: mock(() => Promise.resolve({ count: 0 })),
  },
  $transaction: mock(async (arg: unknown) => {
    if (typeof arg === 'function') return arg(mockPrisma);
    if (Array.isArray(arg)) return Promise.all(arg);
    return null;
  }),
};

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('TimesheetService', () => {
  let service: TimesheetService;

  beforeEach(() => {
    service = new TimesheetService(mockPrisma as never);

    mockPrisma.monthlyTimesheet.findUnique.mockReset();
    mockPrisma.monthlyTimesheet.create.mockReset();
    mockPrisma.monthlyTimesheet.update.mockReset();
    mockPrisma.timesheetWorkLog.deleteMany.mockReset();
  });

  // ─── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should return existing timesheet if already exists', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(mockTimesheet);

      const result = await service.create('member-1', { teamId: 'team-1', yearMonth: '2026-03' });

      expect(result.id).toBe('ts-1');
      expect(result.yearMonth).toBe('2026-03');
      // findUnique called once, create NOT called
      expect(mockPrisma.monthlyTimesheet.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.monthlyTimesheet.create).not.toHaveBeenCalled();
    });

    it('should create a new timesheet if one does not exist', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(null);
      const newTimesheet = { ...mockTimesheet, id: 'ts-new' };
      mockPrisma.monthlyTimesheet.create.mockResolvedValueOnce(newTimesheet);

      const result = await service.create('member-1', { teamId: 'team-1', yearMonth: '2026-03' });

      expect(result.id).toBe('ts-new');
      expect(mockPrisma.monthlyTimesheet.create).toHaveBeenCalledTimes(1);
    });
  });

  // ─── getMyTimesheet ───────────────────────────────────────────────────────

  describe('getMyTimesheet', () => {
    it('should return null when no timesheet exists', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(null);

      const result = await service.getMyTimesheet('member-1', '2026-03', 'team-1');
      expect(result).toBeNull();
    });

    it('should return timesheet when found', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(mockTimesheet);

      const result = await service.getMyTimesheet('member-1', '2026-03', 'team-1');
      expect(result?.id).toBe('ts-1');
    });
  });

  // ─── getById ─────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('should throw TIMESHEET_NOT_FOUND when not found', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(null);

      try {
        await service.getById('nonexistent');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_NOT_FOUND');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return timesheet when found', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(mockTimesheet);

      const result = await service.getById('ts-1');
      expect(result.id).toBe('ts-1');
    });
  });

  // ─── submit ───────────────────────────────────────────────────────────────

  describe('submit', () => {
    it('should throw TIMESHEET_NOT_FOUND when timesheet does not exist', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce(null);

      try {
        await service.submit('nonexistent', 'member-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_NOT_FOUND');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw TIMESHEET_FORBIDDEN when submitting another member\'s timesheet', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce({
        ...mockTimesheet,
        memberId: 'other-member',
        entries: [],
      });

      try {
        await service.submit('ts-1', 'member-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_FORBIDDEN');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should throw TIMESHEET_ALREADY_SUBMITTED when already submitted', async () => {
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce({
        ...mockTimesheet,
        status: TimesheetStatus.SUBMITTED,
        entries: [],
      });

      try {
        await service.submit('ts-1', 'member-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_ALREADY_SUBMITTED');
      }
    });

    it('should throw TIMESHEET_VALIDATION_FAILED when work hours do not match', async () => {
      const workDate = new Date('2026-03-02T00:00:00.000Z'); // Monday
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce({
        ...mockTimesheet,
        memberId: 'member-1',
        status: TimesheetStatus.DRAFT,
        entries: [
          {
            id: 'entry-1',
            date: workDate,
            attendance: 'WORK' as AttendanceType,
            workLogs: [{ id: 'wl-1', hours: 4, projectId: 'proj-1' }], // 4h ≠ 8h required
          },
        ],
      });

      try {
        await service.submit('ts-1', 'member-1');
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_VALIDATION_FAILED');
      }
    });

    it('should submit successfully when all entries have correct hours', async () => {
      const workDate = new Date('2026-03-02T00:00:00.000Z'); // Monday
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce({
        ...mockTimesheet,
        memberId: 'member-1',
        status: TimesheetStatus.DRAFT,
        entries: [
          {
            id: 'entry-1',
            date: workDate,
            attendance: 'WORK' as AttendanceType,
            workLogs: [{ id: 'wl-1', hours: 8, projectId: 'proj-1' }],
          },
        ],
      });

      const submitted = { ...mockTimesheet, status: TimesheetStatus.SUBMITTED, submittedAt: new Date() };
      mockPrisma.monthlyTimesheet.update.mockResolvedValueOnce(submitted);

      const result = await service.submit('ts-1', 'member-1');
      expect(result.status).toBe(TimesheetStatus.SUBMITTED);
      expect(mockPrisma.monthlyTimesheet.update).toHaveBeenCalledTimes(1);
    });

    it('should skip holiday entries during validation', async () => {
      const holidayDate = new Date('2026-03-01T00:00:00.000Z'); // Sunday/holiday
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce({
        ...mockTimesheet,
        memberId: 'member-1',
        status: TimesheetStatus.DRAFT,
        entries: [
          {
            id: 'entry-holiday',
            date: holidayDate,
            attendance: 'HOLIDAY' as AttendanceType,
            workLogs: [],
          },
        ],
      });

      const submitted = { ...mockTimesheet, status: TimesheetStatus.SUBMITTED, submittedAt: new Date() };
      mockPrisma.monthlyTimesheet.update.mockResolvedValueOnce(submitted);

      const result = await service.submit('ts-1', 'member-1');
      expect(result.status).toBe(TimesheetStatus.SUBMITTED);
    });

    it('should delete workLogs on ANNUAL_LEAVE entries during submit', async () => {
      const leaveDate = new Date('2026-03-03T00:00:00.000Z');
      mockPrisma.monthlyTimesheet.findUnique.mockResolvedValueOnce({
        ...mockTimesheet,
        memberId: 'member-1',
        status: TimesheetStatus.DRAFT,
        entries: [
          {
            id: 'entry-leave',
            date: leaveDate,
            attendance: 'ANNUAL_LEAVE' as AttendanceType,
            // workLogs present — should be deleted
            workLogs: [{ id: 'wl-stale', hours: 4, projectId: 'proj-1' }],
          },
        ],
      });

      mockPrisma.timesheetWorkLog.deleteMany.mockResolvedValueOnce({ count: 1 });
      const submitted = { ...mockTimesheet, status: TimesheetStatus.SUBMITTED, submittedAt: new Date() };
      mockPrisma.monthlyTimesheet.update.mockResolvedValueOnce(submitted);

      const result = await service.submit('ts-1', 'member-1');
      expect(result.status).toBe(TimesheetStatus.SUBMITTED);
      expect(mockPrisma.timesheetWorkLog.deleteMany).toHaveBeenCalledTimes(1);
    });
  });
});

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { HttpStatus } from '@nestjs/common';
import { TimesheetEntryService } from './timesheet-entry.service';
import { BusinessException } from '../common/filters/business-exception';

// ─── Shared mock data ─────────────────────────────────────────────────────────

const makeMockEntry = (overrides: Partial<{
  id: string;
  memberId: string;
  status: string;
}> = {}) => ({
  id: overrides.id ?? 'entry-1',
  date: new Date('2026-03-02T00:00:00.000Z'),
  attendance: 'WORK',
  workLogs: [],
  timesheet: {
    id: 'ts-1',
    memberId: overrides.memberId ?? 'member-1',
    status: overrides.status ?? 'DRAFT',
  },
});

const mockUpdatedEntry = {
  id: 'entry-1',
  date: new Date('2026-03-02T00:00:00.000Z'),
  attendance: 'WORK',
  workLogs: [],
};

// ─── Prisma mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  timesheetEntry: {
    findUnique: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
    update: mock(() => Promise.resolve(mockUpdatedEntry)),
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

describe('TimesheetEntryService', () => {
  let service: TimesheetEntryService;

  beforeEach(() => {
    service = new TimesheetEntryService(mockPrisma as never);

    mockPrisma.timesheetEntry.findUnique.mockReset();
    mockPrisma.timesheetEntry.findMany.mockReset();
    mockPrisma.timesheetEntry.update.mockReset();
    mockPrisma.timesheetWorkLog.deleteMany.mockReset();
    mockPrisma.$transaction.mockReset();

    // Restore default $transaction behaviour
    mockPrisma.$transaction.mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(mockPrisma);
      if (Array.isArray(arg)) return Promise.all(arg);
      return null;
    });
    // Restore default update response
    mockPrisma.timesheetEntry.update.mockResolvedValue(mockUpdatedEntry);
  });

  // ─── saveEntry ───────────────────────────────────────────────────────────

  describe('saveEntry', () => {
    it('should throw ENTRY_NOT_FOUND when entry does not exist', async () => {
      mockPrisma.timesheetEntry.findUnique.mockResolvedValueOnce(null);

      try {
        await service.saveEntry('nonexistent', 'member-1', { attendance: 'WORK', workLogs: [] });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('ENTRY_NOT_FOUND');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw ENTRY_FORBIDDEN when saving another member\'s entry', async () => {
      mockPrisma.timesheetEntry.findUnique.mockResolvedValueOnce(
        makeMockEntry({ memberId: 'other-member' }),
      );

      try {
        await service.saveEntry('entry-1', 'member-1', { attendance: 'WORK', workLogs: [] });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('ENTRY_FORBIDDEN');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should throw TIMESHEET_ALREADY_SUBMITTED when timesheet is SUBMITTED', async () => {
      mockPrisma.timesheetEntry.findUnique.mockResolvedValueOnce(
        makeMockEntry({ status: 'SUBMITTED' }),
      );

      try {
        await service.saveEntry('entry-1', 'member-1', { attendance: 'WORK', workLogs: [] });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_ALREADY_SUBMITTED');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should throw TIMESHEET_ALREADY_SUBMITTED when timesheet is APPROVED', async () => {
      mockPrisma.timesheetEntry.findUnique.mockResolvedValueOnce(
        makeMockEntry({ status: 'APPROVED' }),
      );

      try {
        await service.saveEntry('entry-1', 'member-1', { attendance: 'WORK', workLogs: [] });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_ALREADY_SUBMITTED');
      }
    });

    it('should save entry successfully for DRAFT timesheet owner', async () => {
      mockPrisma.timesheetEntry.findUnique.mockResolvedValueOnce(makeMockEntry());

      const result = await service.saveEntry('entry-1', 'member-1', {
        attendance: 'WORK',
        workLogs: [{ projectId: 'proj-1', hours: 8, workType: 'NORMAL' }],
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('entry-1');
    });
  });

  // ─── batchSave ────────────────────────────────────────────────────────────

  describe('batchSave', () => {
    it('should return empty array when entries list is empty', async () => {
      const result = await service.batchSave('member-1', { entries: [] });
      expect(result).toEqual([]);
      expect(mockPrisma.timesheetEntry.findMany).not.toHaveBeenCalled();
    });

    it('should throw ENTRY_NOT_FOUND when some entryIds are missing', async () => {
      // Only 1 entry returned but 2 requested
      mockPrisma.timesheetEntry.findMany.mockResolvedValueOnce([makeMockEntry({ id: 'entry-1' })]);

      try {
        await service.batchSave('member-1', {
          entries: [
            { entryId: 'entry-1', attendance: 'WORK', workLogs: [] },
            { entryId: 'entry-2', attendance: 'WORK', workLogs: [] },
          ],
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('ENTRY_NOT_FOUND');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw ENTRY_FORBIDDEN when batch contains another member\'s entry', async () => {
      mockPrisma.timesheetEntry.findMany.mockResolvedValueOnce([
        makeMockEntry({ id: 'entry-1', memberId: 'member-1' }),
        makeMockEntry({ id: 'entry-2', memberId: 'other-member' }), // unauthorized
      ]);

      try {
        await service.batchSave('member-1', {
          entries: [
            { entryId: 'entry-1', attendance: 'WORK', workLogs: [] },
            { entryId: 'entry-2', attendance: 'WORK', workLogs: [] },
          ],
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('ENTRY_FORBIDDEN');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should throw TIMESHEET_ALREADY_SUBMITTED when any entry has SUBMITTED timesheet', async () => {
      mockPrisma.timesheetEntry.findMany.mockResolvedValueOnce([
        makeMockEntry({ id: 'entry-1', memberId: 'member-1', status: 'DRAFT' }),
        makeMockEntry({ id: 'entry-2', memberId: 'member-1', status: 'SUBMITTED' }),
      ]);

      try {
        await service.batchSave('member-1', {
          entries: [
            { entryId: 'entry-1', attendance: 'WORK', workLogs: [] },
            { entryId: 'entry-2', attendance: 'WORK', workLogs: [] },
          ],
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(BusinessException);
        expect((e as BusinessException).errorCode).toBe('TIMESHEET_ALREADY_SUBMITTED');
        expect((e as BusinessException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should save all entries successfully when all owned and DRAFT', async () => {
      mockPrisma.timesheetEntry.findMany.mockResolvedValueOnce([
        makeMockEntry({ id: 'entry-1', memberId: 'member-1', status: 'DRAFT' }),
        makeMockEntry({ id: 'entry-2', memberId: 'member-1', status: 'DRAFT' }),
      ]);

      // Make $transaction execute the callback with mock tx
      const txEntry1 = { ...mockUpdatedEntry, id: 'entry-1' };
      const txEntry2 = { ...mockUpdatedEntry, id: 'entry-2' };
      mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
        const txPrisma = {
          ...mockPrisma,
          timesheetWorkLog: { deleteMany: mock(() => Promise.resolve({ count: 0 })) },
          timesheetEntry: {
            ...mockPrisma.timesheetEntry,
            update: mock()
              .mockResolvedValueOnce(txEntry1)
              .mockResolvedValueOnce(txEntry2),
          },
        };
        return fn(txPrisma);
      });

      const result = await service.batchSave('member-1', {
        entries: [
          { entryId: 'entry-1', attendance: 'WORK', workLogs: [] },
          { entryId: 'entry-2', attendance: 'WORK', workLogs: [] },
        ],
      });

      expect(result).toHaveLength(2);
    });

    it('should use findMany once for batch ownership verification (no N+1)', async () => {
      mockPrisma.timesheetEntry.findMany.mockResolvedValueOnce([
        makeMockEntry({ id: 'entry-1', memberId: 'member-1', status: 'DRAFT' }),
        makeMockEntry({ id: 'entry-2', memberId: 'member-1', status: 'DRAFT' }),
        makeMockEntry({ id: 'entry-3', memberId: 'member-1', status: 'DRAFT' }),
      ]);

      mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
        const txPrisma = {
          ...mockPrisma,
          timesheetWorkLog: { deleteMany: mock(() => Promise.resolve({ count: 0 })) },
          timesheetEntry: {
            ...mockPrisma.timesheetEntry,
            update: mock()
              .mockResolvedValueOnce({ ...mockUpdatedEntry, id: 'entry-1' })
              .mockResolvedValueOnce({ ...mockUpdatedEntry, id: 'entry-2' })
              .mockResolvedValueOnce({ ...mockUpdatedEntry, id: 'entry-3' }),
          },
        };
        return fn(txPrisma);
      });

      await service.batchSave('member-1', {
        entries: [
          { entryId: 'entry-1', attendance: 'WORK', workLogs: [] },
          { entryId: 'entry-2', attendance: 'WORK', workLogs: [] },
          { entryId: 'entry-3', attendance: 'WORK', workLogs: [] },
        ],
      });

      // findMany should be called exactly once regardless of entry count
      expect(mockPrisma.timesheetEntry.findMany).toHaveBeenCalledTimes(1);
    });
  });
});

import { Injectable, Logger } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from '../common/filters/business-exception';
import { SaveEntryDto } from './dto/save-entry.dto';
import { BatchSaveEntriesDto } from './dto/batch-save-entries.dto';
import { AttendanceType, WorkType } from '@prisma/client';

@Injectable()
export class TimesheetEntryService {
  private readonly logger = new Logger(TimesheetEntryService.name);

  constructor(private prisma: PrismaService) {}

  /** 일별 엔트리 저장 (근태 + 워크로그 교체) */
  async saveEntry(entryId: string, memberId: string, dto: SaveEntryDto) {
    const entry = await this.prisma.timesheetEntry.findUnique({
      where: { id: entryId },
      include: { timesheet: { select: { id: true, memberId: true, status: true } } },
    });

    if (!entry) {
      throw new BusinessException('ENTRY_NOT_FOUND', '엔트리를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    if (entry.timesheet.memberId !== memberId) {
      throw new BusinessException('ENTRY_FORBIDDEN', '본인의 시간표 엔트리만 수정할 수 있습니다.', HttpStatus.FORBIDDEN);
    }

    const { status } = entry.timesheet;
    if (status === 'SUBMITTED' || status === 'APPROVED') {
      throw new BusinessException(
        'TIMESHEET_ALREADY_SUBMITTED',
        '제출 또는 승인된 시간표는 수정할 수 없습니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    // 기존 워크로그 삭제 후 재생성
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.timesheetWorkLog.deleteMany({ where: { entryId } });

      return tx.timesheetEntry.update({
        where: { id: entryId },
        data: {
          attendance: dto.attendance as AttendanceType,
          workLogs: dto.workLogs && dto.workLogs.length > 0
            ? {
                create: dto.workLogs.map((wl) => ({
                  projectId: wl.projectId,
                  hours: wl.hours,
                  workType: wl.workType as WorkType,
                })),
              }
            : undefined,
        },
        include: {
          workLogs: { include: { project: { select: { id: true, name: true, code: true } } } },
        },
      });
    });

    this.logger.log(`엔트리 저장: entryId=${entryId}`);
    return updated;
  }

  /** 배치 저장 (여러 엔트리 일괄 저장) */
  async batchSave(memberId: string, dto: BatchSaveEntriesDto) {
    if (!dto.entries || dto.entries.length === 0) {
      return [];
    }

    // B-8: 보안 강화 — 모든 엔트리의 timesheetId 기반 일괄 소유권 검증
    const entryIds = dto.entries.map((e) => e.entryId);
    const entriesWithTimesheet = await this.prisma.timesheetEntry.findMany({
      where: { id: { in: entryIds } },
      include: { timesheet: { select: { id: true, memberId: true, status: true } } },
    });

    if (entriesWithTimesheet.length !== dto.entries.length) {
      throw new BusinessException('ENTRY_NOT_FOUND', '일부 엔트리를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 모든 엔트리가 요청자 소유인지 확인
    const unauthorizedEntry = entriesWithTimesheet.find((e) => e.timesheet.memberId !== memberId);
    if (unauthorizedEntry) {
      throw new BusinessException('ENTRY_FORBIDDEN', '본인의 시간표 엔트리만 수정할 수 있습니다.', HttpStatus.FORBIDDEN);
    }

    // 모든 엔트리의 시간표 상태 확인
    const submittedEntry = entriesWithTimesheet.find(
      (e) => e.timesheet.status === 'SUBMITTED' || e.timesheet.status === 'APPROVED',
    );
    if (submittedEntry) {
      throw new BusinessException(
        'TIMESHEET_ALREADY_SUBMITTED',
        '제출 또는 승인된 시간표는 수정할 수 없습니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    // ISSUE-13: deleteMany 통합으로 N*2 쿼리를 (1+N) 쿼리로 최적화
    // 기존: N번 deleteMany + N번 update → 개선: 1번 deleteMany + N번 update(nested create)
    const results = await this.prisma.$transaction(async (tx) => {
      // 1. 전체 엔트리의 기존 워크로그 일괄 삭제 (N→1 쿼리)
      await tx.timesheetWorkLog.deleteMany({ where: { entryId: { in: entryIds } } });

      // 2. attendance + 새 워크로그를 엔트리별 update (nested create)로 처리
      return Promise.all(
        dto.entries.map((entryDto) =>
          tx.timesheetEntry.update({
            where: { id: entryDto.entryId },
            data: {
              attendance: entryDto.attendance as AttendanceType,
              workLogs: entryDto.workLogs && entryDto.workLogs.length > 0
                ? {
                    create: entryDto.workLogs.map((wl) => ({
                      projectId: wl.projectId,
                      hours: wl.hours,
                      workType: wl.workType as WorkType,
                    })),
                  }
                : undefined,
            },
            include: {
              workLogs: { include: { project: { select: { id: true, name: true, code: true } } } },
            },
          }),
        ),
      );
    });

    this.logger.log(`배치 저장: memberId=${memberId}, count=${dto.entries.length}`);
    return results;
  }
}

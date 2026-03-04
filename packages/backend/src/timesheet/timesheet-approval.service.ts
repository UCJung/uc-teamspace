import { Injectable, Logger } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from '../common/filters/business-exception';
import { ApprovalType, MemberRole, TimesheetStatus } from '@prisma/client';

@Injectable()
export class TimesheetApprovalService {
  private readonly logger = new Logger(TimesheetApprovalService.name);

  constructor(private prisma: PrismaService) {}

  /** 팀장 승인: SUBMITTED → APPROVED (LEADER approval) */
  async leaderApprove(timesheetId: string, approverId: string) {
    const timesheet = await this.findAndVerifySubmitted(timesheetId, '제출된 시간표만 승인할 수 있습니다.');

    // 이미 LEADER 승인이 있으면 삭제 후 재생성
    const existing = timesheet.approvals.find((a) => a.approvalType === ApprovalType.LEADER);
    if (existing) {
      await this.prisma.timesheetApproval.delete({ where: { id: existing.id } });
    }

    const approval = await this.prisma.$transaction(async (tx) => {
      const created = await tx.timesheetApproval.create({
        data: {
          timesheetId,
          approverId,
          approvalType: ApprovalType.LEADER,
          status: TimesheetStatus.APPROVED,
          approvedAt: new Date(),
        },
        include: { approver: { select: { id: true, name: true } } },
      });

      await tx.monthlyTimesheet.update({
        where: { id: timesheetId },
        data: { status: TimesheetStatus.APPROVED },
      });

      return created;
    });

    this.logger.log(`팀장 승인: timesheetId=${timesheetId}, approverId=${approverId}`);
    return approval;
  }

  async batchLeaderApprove(timesheetIds: string[], approverId: string) {
    if (!timesheetIds || timesheetIds.length === 0) {
      throw new BusinessException('INVALID_INPUT', '승인할 시간표를 선택해주세요.', HttpStatus.BAD_REQUEST);
    }

    const timesheets = await this.prisma.monthlyTimesheet.findMany({
      where: { id: { in: timesheetIds }, status: TimesheetStatus.SUBMITTED },
      include: { approvals: true, member: { select: { id: true, name: true } } },
    });

    if (timesheets.length === 0) {
      throw new BusinessException('NO_SUBMITTED_TIMESHEETS', '제출된 시간표가 없습니다.', HttpStatus.BAD_REQUEST);
    }

    const results = await this.prisma.$transaction(async (tx) => {
      const approved: string[] = [];

      for (const ts of timesheets) {
        // 기존 LEADER 승인 삭제
        const existing = ts.approvals.find((a) => a.approvalType === ApprovalType.LEADER);
        if (existing) {
          await tx.timesheetApproval.delete({ where: { id: existing.id } });
        }

        await tx.timesheetApproval.create({
          data: {
            timesheetId: ts.id,
            approverId,
            approvalType: ApprovalType.LEADER,
            status: TimesheetStatus.APPROVED,
            approvedAt: new Date(),
          },
        });

        await tx.monthlyTimesheet.update({
          where: { id: ts.id },
          data: { status: TimesheetStatus.APPROVED },
        });

        approved.push(ts.id);
      }

      return approved;
    });

    this.logger.log(`일괄 승인: ${results.length}건, approverId=${approverId}`);
    return { approvedCount: results.length, approvedIds: results };
  }

  /** 팀장 반려: SUBMITTED → REJECTED (comment 필수) */
  async leaderReject(timesheetId: string, approverId: string, comment: string) {
    if (!comment || comment.trim().length === 0) {
      throw new BusinessException('REJECT_COMMENT_REQUIRED', '반려 사유(comment)가 필요합니다.', HttpStatus.BAD_REQUEST);
    }

    const timesheet = await this.findAndVerifySubmitted(timesheetId, '제출된 시간표만 반려할 수 있습니다.');

    // 기존 LEADER 승인 레코드 삭제
    const existing = timesheet.approvals.find((a) => a.approvalType === ApprovalType.LEADER);
    if (existing) {
      await this.prisma.timesheetApproval.delete({ where: { id: existing.id } });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const approval = await tx.timesheetApproval.create({
        data: {
          timesheetId,
          approverId,
          approvalType: ApprovalType.LEADER,
          status: TimesheetStatus.REJECTED,
          comment: comment.trim(),
          approvedAt: new Date(),
        },
        include: { approver: { select: { id: true, name: true } } },
      });

      await tx.monthlyTimesheet.update({
        where: { id: timesheetId },
        data: { status: TimesheetStatus.REJECTED },
      });

      return approval;
    });

    this.logger.log(`팀장 반려: timesheetId=${timesheetId}, approverId=${approverId}`);
    return result;
  }

  /** PM 승인: 해당 프로젝트가 포함된 시간표들에 PROJECT_MANAGER 승인 생성 */
  async projectApprove(projectId: string, yearMonth: string, approverId: string) {
    // PM 본인이 해당 프로젝트의 managerId인지 검증
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, managerId: true },
    });

    if (!project) {
      throw new BusinessException('PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // ADMIN은 모든 프로젝트 승인 가능, 그 외는 managerId 검증
    const approver = await this.prisma.member.findUnique({
      where: { id: approverId },
      select: { id: true, roles: true },
    });

    const isAdmin = approver?.roles.includes(MemberRole.ADMIN);
    if (!isAdmin && project.managerId !== approverId) {
      throw new BusinessException(
        'PROJECT_APPROVE_FORBIDDEN',
        '해당 프로젝트의 PM만 승인할 수 있습니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    // 해당 yearMonth에 해당 프로젝트 워크로그가 있는 시간표 조회
    const timesheets = await this.prisma.monthlyTimesheet.findMany({
      where: {
        yearMonth,
        entries: {
          some: {
            workLogs: { some: { projectId } },
          },
        },
      },
      include: { approvals: true },
    });

    if (timesheets.length === 0) {
      return { approved: 0, message: '해당 프로젝트에 대한 시간표가 없습니다.' };
    }

    const now = new Date();
    const ops = timesheets.map((ts) => {
      const existing = ts.approvals.find((a) => a.approvalType === ApprovalType.PROJECT_MANAGER);
      if (existing) {
        return this.prisma.timesheetApproval.update({
          where: { id: existing.id },
          data: { status: TimesheetStatus.APPROVED, approvedAt: now, autoApproved: false },
        });
      }
      return this.prisma.timesheetApproval.create({
        data: {
          timesheetId: ts.id,
          approverId,
          approvalType: ApprovalType.PROJECT_MANAGER,
          status: TimesheetStatus.APPROVED,
          approvedAt: now,
        },
      });
    });

    await this.prisma.$transaction(ops);
    const approved = timesheets.length;

    this.logger.log(`PM 승인: projectId=${projectId}, yearMonth=${yearMonth}, approved=${approved}`);
    return { approved, message: `${approved}건의 시간표에 PM 승인이 완료되었습니다.` };
  }

  /** 관리자 최종 승인: 모든 팀장+PM 승인 완료 확인 후 ADMIN 승인 */
  async adminApprove(yearMonth: string, approverId: string) {
    // 해당 월의 SUBMITTED 또는 APPROVED 상태 시간표 중 아직 ADMIN 승인이 없는 것들
    const timesheets = await this.prisma.monthlyTimesheet.findMany({
      where: {
        yearMonth,
        status: TimesheetStatus.APPROVED,
      },
      include: {
        approvals: true,
        member: { select: { id: true, name: true } },
      },
    });

    if (timesheets.length === 0) {
      return { approved: 0, message: '최종 승인 대상 시간표가 없습니다. (팀장 승인 완료된 시간표만 최종 승인 가능)' };
    }

    const errors: string[] = [];
    const now = new Date();

    // 팀장 승인이 없는 시간표는 제외하고 ops 구성
    const eligibleTimesheets = timesheets.filter((ts) => {
      const leaderApproval = ts.approvals.find(
        (a) => a.approvalType === ApprovalType.LEADER && a.status === TimesheetStatus.APPROVED,
      );
      if (!leaderApproval) {
        errors.push(`${ts.member.name}의 시간표에 팀장 승인이 없습니다.`);
        return false;
      }
      return true;
    });

    if (eligibleTimesheets.length > 0) {
      const ops = eligibleTimesheets.map((ts) => {
        const existingAdmin = ts.approvals.find((a) => a.approvalType === ApprovalType.ADMIN);
        if (existingAdmin) {
          return this.prisma.timesheetApproval.update({
            where: { id: existingAdmin.id },
            data: { status: TimesheetStatus.APPROVED, approvedAt: now },
          });
        }
        return this.prisma.timesheetApproval.create({
          data: {
            timesheetId: ts.id,
            approverId,
            approvalType: ApprovalType.ADMIN,
            status: TimesheetStatus.APPROVED,
            approvedAt: now,
          },
        });
      });

      await this.prisma.$transaction(ops);
    }

    const approved = eligibleTimesheets.length;
    this.logger.log(`관리자 최종 승인: yearMonth=${yearMonth}, approved=${approved}`);

    return {
      approved,
      errors,
      message: `${approved}건 최종 승인 완료${errors.length > 0 ? `, ${errors.length}건 미처리` : ''}`,
    };
  }

  /** 공통 헬퍼: 시간표 조회 + SUBMITTED 상태 검증 */
  private async findAndVerifySubmitted(timesheetId: string, errorMessage = '제출된 시간표만 처리할 수 있습니다.') {
    const timesheet = await this.prisma.monthlyTimesheet.findUnique({
      where: { id: timesheetId },
      include: {
        member: { select: { id: true, name: true } },
        approvals: true,
      },
    });

    if (!timesheet) {
      throw new BusinessException('TIMESHEET_NOT_FOUND', '시간표를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    if (timesheet.status !== TimesheetStatus.SUBMITTED) {
      throw new BusinessException('TIMESHEET_NOT_SUBMITTED', errorMessage, HttpStatus.BAD_REQUEST);
    }

    return timesheet;
  }
}
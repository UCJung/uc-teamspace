import { Injectable, HttpStatus } from '@nestjs/common';
import { ProjectStatus, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from '../common/filters/business-exception';
import { CreateWorkItemDto } from './dto/create-work-item.dto';
import { UpdateWorkItemDto } from './dto/update-work-item.dto';
import { ReorderWorkItemsDto } from './dto/reorder-work-items.dto';
import { getWeekRange } from '@uc-teamspace/shared/constants/week-utils';

@Injectable()
export class WorkItemService {
  constructor(private prisma: PrismaService) {}

  async findByReportId(weeklyReportId: string) {
    return this.prisma.workItem.findMany({
      where: { weeklyReportId },
      orderBy: { sortOrder: 'asc' },
      include: { project: true },
    });
  }

  async create(weeklyReportId: string, memberId: string, dto: CreateWorkItemDto) {
    await this.findReportAndVerify(weeklyReportId, memberId);

    // INACTIVE 프로젝트 제약: 사용안함 프로젝트에는 신규 업무항목 작성 불가
    if (dto.projectId) {
      await this.verifyProjectActive(dto.projectId);
    }

    const last = await this.prisma.workItem.findFirst({
      where: { weeklyReportId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder = (last?.sortOrder ?? -1) + 1;

    const data: Record<string, unknown> = {
      weeklyReportId,
      doneWork: dto.doneWork ?? '',
      planWork: dto.planWork ?? '',
      remarks: dto.remarks ?? '',
      sortOrder,
    };
    if (dto.projectId) {
      data.projectId = dto.projectId;
    }

    return this.prisma.workItem.create({
      data: data as Parameters<typeof this.prisma.workItem.create>[0]['data'],
      include: { project: true },
    });
  }

  async update(id: string, memberId: string, dto: UpdateWorkItemDto) {
    const workItem = await this.findWorkItemAndVerify(id, memberId);

    if (workItem.weeklyReport.status === ReportStatus.SUBMITTED) {
      throw new BusinessException(
        'WEEKLY_REPORT_SUBMITTED',
        '제출된 주간업무의 항목은 수정할 수 없습니다.',
        HttpStatus.CONFLICT,
      );
    }

    // INACTIVE 프로젝트 제약: 프로젝트를 변경하는 경우 INACTIVE 프로젝트로 변경 불가
    if (dto.projectId && dto.projectId !== workItem.projectId) {
      await this.verifyProjectActive(dto.projectId);
    }

    return this.prisma.workItem.update({
      where: { id },
      data: dto,
      include: { project: true },
    });
  }

  async delete(id: string, memberId: string) {
    await this.findWorkItemAndVerify(id, memberId);

    await this.prisma.workItem.delete({ where: { id } });
    return { deleted: true };
  }

  async deleteByProject(reportId: string, projectId: string, memberId: string) {
    await this.findReportAndVerify(reportId, memberId);

    const result = await this.prisma.workItem.deleteMany({
      where: { weeklyReportId: reportId, projectId },
    });

    return { deleted: result.count };
  }

  async reorder(memberId: string, dto: ReorderWorkItemsDto) {
    // ISSUE-06: 상한선 가드 — 무제한 UPDATE 방지
    // NOTE: Prisma의 updateMany는 모든 행에 동일한 값만 설정 가능하여,
    // 행별로 다른 sortOrder 지정 시 개별 update가 필요합니다. (배치 upsert 제약)
    if (dto.items.length > 50) {
      throw new BusinessException(
        'REORDER_LIMIT_EXCEEDED',
        '정렬 항목은 최대 50개까지 가능합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 모든 항목이 본인 소유인지 검증
    const ids = dto.items.map((i) => i.id);
    const workItems = await this.prisma.workItem.findMany({
      where: { id: { in: ids } },
      include: { weeklyReport: true },
    });

    for (const item of workItems) {
      if (item.weeklyReport.memberId !== memberId) {
        throw new BusinessException(
          'WORK_ITEM_FORBIDDEN',
          '본인의 업무항목만 수정할 수 있습니다.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.workItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { reordered: dto.items.length };
  }

  private async findReportAndVerify(weeklyReportId: string, memberId: string) {
    const report = await this.prisma.weeklyReport.findUnique({
      where: { id: weeklyReportId },
    });

    if (!report) {
      throw new BusinessException(
        'WEEKLY_REPORT_NOT_FOUND',
        '해당 주간업무를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (report.memberId !== memberId) {
      throw new BusinessException(
        'WEEKLY_REPORT_FORBIDDEN',
        '본인의 주간업무만 접근할 수 있습니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (report.status === ReportStatus.SUBMITTED) {
      throw new BusinessException(
        'WEEKLY_REPORT_SUBMITTED',
        '제출된 주간업무에는 항목을 추가할 수 없습니다.',
        HttpStatus.CONFLICT,
      );
    }

    return report;
  }

  private async verifyProjectActive(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true, name: true },
    });
    if (!project) {
      throw new BusinessException(
        'PROJECT_NOT_FOUND',
        '프로젝트를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (project.status === ProjectStatus.INACTIVE) {
      throw new BusinessException(
        'PROJECT_INACTIVE',
        `"${project.name}" 프로젝트는 사용안함 상태입니다. 신규 업무항목을 작성할 수 없습니다.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private async findWorkItemAndVerify(id: string, memberId: string) {
    const workItem = await this.prisma.workItem.findUnique({
      where: { id },
      include: { weeklyReport: true },
    });

    if (!workItem) {
      throw new BusinessException(
        'WORK_ITEM_NOT_FOUND',
        '업무항목을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (workItem.weeklyReport.memberId !== memberId) {
      throw new BusinessException(
        'WORK_ITEM_FORBIDDEN',
        '본인의 업무항목만 접근할 수 있습니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    return workItem;
  }

  async getLinkedTasks(id: string, memberId: string) {
    // WorkItem 조회 및 권한 검증
    const workItem = await this.findWorkItemAndVerify(id, memberId);

    // projectId가 없으면 빈 배열 반환
    if (!workItem.projectId) {
      return {
        workItemId: workItem.id,
        projectId: null,
        weekLabel: null,
        tasks: [],
      };
    }

    // WeeklyReport 조회 (weekLabel, weekStart)
    const weeklyReport = await this.prisma.weeklyReport.findUnique({
      where: { id: workItem.weeklyReportId },
      select: { id: true, weekLabel: true, weekStart: true, memberId: true },
    });

    if (!weeklyReport) {
      throw new BusinessException(
        'WEEKLY_REPORT_NOT_FOUND',
        '해당 주간업무를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    // 주차 범위 계산
    const { start: weekStart, end: weekEnd } = getWeekRange(weeklyReport.weekLabel);

    // PersonalTask 조회 — 같은 멤버/프로젝트 + (linkedWeekLabel 일치 OR 날짜 범위 내)
    const tasks = await this.prisma.personalTask.findMany({
      where: {
        memberId: weeklyReport.memberId,
        projectId: workItem.projectId,
        isDeleted: false,
        OR: [
          { linkedWeekLabel: weeklyReport.weekLabel },
          {
            AND: [
              { dueDate: { gte: weekStart, lt: weekEnd } },
            ],
          },
          {
            AND: [
              { scheduledDate: { gte: weekStart, lt: weekEnd } },
            ],
          },
        ],
      },
      include: {
        taskStatus: {
          select: {
            id: true,
            name: true,
            category: true,
            color: true,
          },
        },
      },
    });

    return {
      workItemId: workItem.id,
      projectId: workItem.projectId,
      weekLabel: weeklyReport.weekLabel,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        memo: task.memo,
        priority: task.priority,
        statusId: task.statusId,
        taskStatus: task.taskStatus,
        dueDate: task.dueDate,
        scheduledDate: task.scheduledDate,
        linkedWeekLabel: task.linkedWeekLabel,
        completedAt: task.completedAt,
      })),
    };
  }
}

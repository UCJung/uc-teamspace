import { Injectable, HttpStatus } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from '../common/filters/business-exception';
import { CreatePartSummaryDto } from './dto/create-part-summary.dto';
import { UpdatePartSummaryDto } from './dto/update-part-summary.dto';
import { getWeekRange } from './week-utils';

@Injectable()
export class PartSummaryService {
  constructor(private prisma: PrismaService) {}

  async findByPartAndWeek(partId: string, weekLabel: string) {
    const { start } = getWeekRange(weekLabel);
    return this.prisma.partSummary.findUnique({
      where: { partId_weekStart: { partId, weekStart: start } },
      include: {
        summaryWorkItems: {
          orderBy: { sortOrder: 'asc' },
          include: { project: true },
        },
      },
    });
  }

  async create(dto: CreatePartSummaryDto) {
    const { start } = getWeekRange(dto.weekLabel);

    const existing = await this.prisma.partSummary.findUnique({
      where: { partId_weekStart: { partId: dto.partId, weekStart: start } },
    });

    if (existing) {
      throw new BusinessException(
        'PART_SUMMARY_ALREADY_EXISTS',
        '해당 파트·주차의 취합보고가 이미 존재합니다.',
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.partSummary.create({
      data: {
        partId: dto.partId,
        weekStart: start,
        weekLabel: dto.weekLabel,
        status: ReportStatus.DRAFT,
      },
      include: { summaryWorkItems: true },
    });
  }

  async update(id: string, dto: UpdatePartSummaryDto) {
    const summary = await this.findById(id);

    return this.prisma.partSummary.update({
      where: { id: summary.id },
      data: { ...(dto.status && { status: dto.status }) },
      include: {
        summaryWorkItems: {
          orderBy: { sortOrder: 'asc' },
          include: { project: true },
        },
      },
    });
  }

  async autoMerge(id: string) {
    const summary = await this.findById(id);

    // 해당 파트 팀원들의 WeeklyReport 조회
    const members = await this.prisma.member.findMany({
      where: { partId: summary.partId, isActive: true },
    });

    const memberIds = members.map((m) => m.id);

    const reports = await this.prisma.weeklyReport.findMany({
      where: {
        memberId: { in: memberIds },
        weekStart: summary.weekStart,
      },
      include: {
        member: true,
        workItems: {
          include: { project: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // 기존 SummaryWorkItem 삭제
    await this.prisma.summaryWorkItem.deleteMany({
      where: { partSummaryId: id },
    });

    // WorkItem을 Project별로 그룹화 후 병합
    const projectMap = new Map<string, {
      projectId: string;
      doneWorks: string[];
      planWorks: string[];
    }>();

    for (const report of reports) {
      for (const item of report.workItems) {
        const key = item.projectId ?? '__no_project__';
        if (!projectMap.has(key)) {
          projectMap.set(key, { projectId: key, doneWorks: [], planWorks: [] });
        }
        const entry = projectMap.get(key)!;

        if (item.doneWork.trim()) {
          entry.doneWorks.push(`[${report.member.name}] ${item.doneWork.trim()}`);
        }
        if (item.planWork.trim()) {
          entry.planWorks.push(`[${report.member.name}] ${item.planWork.trim()}`);
        }
      }
    }

    // SummaryWorkItem 생성
    const summaryItems = await this.prisma.$transaction(
      Array.from(projectMap.entries()).map(([, entry], idx) =>
        this.prisma.summaryWorkItem.create({
          data: {
            partSummaryId: id,
            projectId: entry.projectId,
            doneWork: entry.doneWorks.join('\n'),
            planWork: entry.planWorks.join('\n'),
            remarks: '',
            sortOrder: idx,
          },
          include: { project: true },
        }),
      ),
    );

    return {
      summary,
      summaryWorkItems: summaryItems,
      mergedCount: summaryItems.length,
    };
  }

  async getPartWeeklyStatus(partId: string, week: string) {
    const { start } = getWeekRange(week);

    const members = await this.prisma.member.findMany({
      where: { partId, isActive: true },
      include: {
        weeklyReports: {
          where: { weekStart: start },
          include: {
            workItems: {
              include: { project: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    return members.map((member) => ({
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
      },
      report: member.weeklyReports[0] ?? null,
    }));
  }

  async getPartSubmissionStatus(partId: string, week: string) {
    const { start } = getWeekRange(week);

    const members = await this.prisma.member.findMany({
      where: { partId, isActive: true },
      include: {
        weeklyReports: {
          where: { weekStart: start },
          select: { id: true, status: true },
        },
      },
    });

    return members.map((member) => {
      const report = member.weeklyReports[0];
      return {
        memberId: member.id,
        memberName: member.name,
        status: report ? report.status : 'NOT_STARTED',
      };
    });
  }

  async getTeamWeeklyOverview(teamId: string, week: string) {
    const { start } = getWeekRange(week);

    const parts = await this.prisma.part.findMany({
      where: { teamId },
      include: {
        members: {
          where: { isActive: true },
          include: {
            weeklyReports: {
              where: { weekStart: start },
              include: {
                workItems: {
                  include: { project: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        partSummaries: {
          where: { weekStart: start },
          select: { id: true, status: true },
        },
      },
    });

    return parts.map((part) => ({
      part: { id: part.id, name: part.name },
      summaryStatus: part.partSummaries[0]?.status ?? 'NOT_STARTED',
      members: part.members.map((member) => ({
        member: { id: member.id, name: member.name, role: member.role },
        report: member.weeklyReports[0] ?? null,
      })),
    }));
  }

  private async findById(id: string) {
    const summary = await this.prisma.partSummary.findUnique({
      where: { id },
      include: {
        summaryWorkItems: true,
      },
    });

    if (!summary) {
      throw new BusinessException(
        'PART_SUMMARY_NOT_FOUND',
        '파트 취합보고를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    return summary;
  }
}

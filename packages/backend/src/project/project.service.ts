import { Injectable, HttpStatus } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from '../common/filters/business-exception';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { ReorderProjectsDto } from './dto/reorder-projects.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProjectQueryDto) {
    const { category, status, page = 1, limit = 20 } = query;
    const where = {
      ...(category && { category }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new BusinessException(
        'PROJECT_NOT_FOUND',
        '프로젝트를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findById(id);
    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async reorder(dto: ReorderProjectsDto) {
    return this.prisma.$transaction(
      dto.orderedIds.map((id, index) =>
        this.prisma.project.update({ where: { id }, data: { sortOrder: index } })
      )
    );
  }

  async softDelete(id: string) {
    await this.findById(id);

    const workItemCount = await this.prisma.workItem.count({
      where: { projectId: id },
    });

    const project = await this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.INACTIVE },
    });

    return {
      ...project,
      _warning: workItemCount > 0
        ? `이 프로젝트에 ${workItemCount}건의 업무항목이 연결되어 있습니다.`
        : undefined,
    };
  }
}

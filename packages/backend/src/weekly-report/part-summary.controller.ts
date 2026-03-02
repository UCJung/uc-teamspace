import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MemberRole, SummaryScope } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PartSummaryService } from './part-summary.service';
import { CreatePartSummaryDto } from './dto/create-part-summary.dto';
import { UpdatePartSummaryDto } from './dto/update-part-summary.dto';
import { PartWeeklyStatusQueryDto } from './dto/part-weekly-status-query.dto';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { MergeRowsDto } from './dto/merge-rows.dto';
import { UpdateSummaryWorkItemDto } from './dto/update-summary-work-item.dto';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartSummaryController {
  constructor(private partSummaryService: PartSummaryService) {}

  @Get('parts/:partId/weekly-status')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async getWeeklyStatus(
    @Param('partId') partId: string,
    @Query() query: PartWeeklyStatusQueryDto,
  ) {
    return this.partSummaryService.getPartWeeklyStatus(partId, query.week);
  }

  @Get('parts/:partId/submission-status')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async getSubmissionStatus(
    @Param('partId') partId: string,
    @Query() query: PartWeeklyStatusQueryDto,
  ) {
    return this.partSummaryService.getPartSubmissionStatus(partId, query.week);
  }

  @Post('part-summaries')
  @Roles(MemberRole.PART_LEADER, MemberRole.LEADER)
  async create(@Body() dto: CreatePartSummaryDto) {
    return this.partSummaryService.create(dto);
  }

  @Post('part-summaries/:id/auto-merge')
  @Roles(MemberRole.PART_LEADER, MemberRole.LEADER)
  async autoMerge(@Param('id') id: string) {
    return this.partSummaryService.autoMerge(id);
  }

  @Patch('part-summaries/:id')
  @Roles(MemberRole.PART_LEADER, MemberRole.LEADER)
  async update(@Param('id') id: string, @Body() dto: UpdatePartSummaryDto) {
    return this.partSummaryService.update(id, dto);
  }

  @Get('teams/:teamId/weekly-overview')
  @Roles(MemberRole.LEADER)
  async getTeamOverview(
    @Param('teamId') teamId: string,
    @Query() query: PartWeeklyStatusQueryDto,
  ) {
    return this.partSummaryService.getTeamWeeklyOverview(teamId, query.week);
  }

  @Get('teams/:teamId/members-weekly-status')
  @Roles(MemberRole.LEADER)
  async getTeamMembersWeeklyStatus(
    @Param('teamId') teamId: string,
    @Query() query: PartWeeklyStatusQueryDto,
  ) {
    return this.partSummaryService.getTeamMembersWeeklyStatus(teamId, query.week);
  }

  // ── 신규 취합 엔드포인트 ──

  @Get('summaries')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async getSummary(
    @Query('scope') scope: SummaryScope,
    @Query('partId') partId?: string,
    @Query('teamId') teamId?: string,
    @Query('week') week?: string,
  ) {
    if (!week) return null;
    return this.partSummaryService.findByScopeAndWeek({ scope, partId, teamId, weekLabel: week });
  }

  @Post('summaries')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async createSummary(@Body() dto: CreateSummaryDto) {
    return this.partSummaryService.createSummary(dto);
  }

  @Post('summaries/:id/load-rows')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async loadRows(@Param('id') id: string) {
    return this.partSummaryService.loadMemberRows(id);
  }

  @Post('summaries/:id/merge-rows')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async mergeRows(@Param('id') id: string, @Body() dto: MergeRowsDto) {
    return this.partSummaryService.mergeRows(id, dto);
  }

  @Patch('summaries/:id')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async updateSummary(@Param('id') id: string, @Body() dto: UpdatePartSummaryDto) {
    return this.partSummaryService.update(id, dto);
  }

  @Patch('summary-work-items/:id')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async updateSummaryWorkItem(
    @Param('id') id: string,
    @Body() dto: UpdateSummaryWorkItemDto,
  ) {
    return this.partSummaryService.updateSummaryWorkItem(id, dto);
  }

  @Delete('summary-work-items/:id')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async deleteSummaryWorkItem(@Param('id') id: string) {
    return this.partSummaryService.deleteSummaryWorkItem(id);
  }
}

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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PersonalTaskService } from './personal-task.service';
import { CreatePersonalTaskDto } from './dto/create-personal-task.dto';
import { UpdatePersonalTaskDto } from './dto/update-personal-task.dto';
import { ListPersonalTasksQueryDto } from './dto/list-personal-tasks-query.dto';
import { ReorderPersonalTasksDto } from './dto/reorder-personal-tasks.dto';
import { ImportToWeeklyReportDto } from './dto/import-to-weekly-report.dto';
import { ImportFromWeeklyReportDto } from './dto/import-from-weekly-report.dto';

@Controller('api/v1/personal-tasks')
@UseGuards(JwtAuthGuard)
export class PersonalTaskController {
  constructor(private personalTaskService: PersonalTaskService) {}

  /** GET /api/v1/personal-tasks — 개인 작업 목록 조회 */
  @Get()
  async findAll(
    @CurrentUser('id') memberId: string,
    @Query() query: ListPersonalTasksQueryDto,
  ) {
    return this.personalTaskService.findAll(memberId, query);
  }

  /** POST /api/v1/personal-tasks — 개인 작업 생성 */
  @Post()
  async create(
    @CurrentUser('id') memberId: string,
    @Body() dto: CreatePersonalTaskDto,
  ) {
    return this.personalTaskService.create(memberId, dto);
  }

  /** PATCH /api/v1/personal-tasks/reorder — DnD 정렬 (/:id 앞에 선언 필수) */
  @Patch('reorder')
  async reorder(
    @CurrentUser('id') memberId: string,
    @Body() dto: ReorderPersonalTasksDto,
  ) {
    return this.personalTaskService.reorder(memberId, dto);
  }

  /** POST /api/v1/personal-tasks/import-to-weekly — 개인 작업 → 주간업무 WorkItem으로 가져오기 */
  @Post('import-to-weekly')
  async importToWeekly(
    @CurrentUser('id') memberId: string,
    @Body() dto: ImportToWeeklyReportDto,
  ) {
    return this.personalTaskService.importToWeekly(memberId, dto);
  }

  /** POST /api/v1/personal-tasks/import-from-weekly — 주간업무 할일 → 개인 작업으로 가져오기 */
  @Post('import-from-weekly')
  async importFromWeekly(
    @CurrentUser('id') memberId: string,
    @Body() dto: ImportFromWeeklyReportDto,
  ) {
    return this.personalTaskService.importFromWeekly(memberId, dto);
  }

  /** GET /api/v1/personal-tasks/summary — 개인 작업 요약 (오늘/기한임박/이번주완료/기한초과 카운트) */
  @Get('summary')
  async getSummary(
    @CurrentUser('id') memberId: string,
    @Query('teamId') teamId: string,
  ) {
    return this.personalTaskService.getSummary(memberId, teamId);
  }

  /** GET /api/v1/personal-tasks/part-overview — 파트원별 작업 건수 요약 (파트장/팀장/관리자 전용, 서비스에서 권한 체크) */
  @Get('part-overview')
  async getPartOverview(
    @CurrentUser('id') memberId: string,
    @Query('teamId') teamId: string,
    @Query('partId') partId?: string,
  ) {
    return this.personalTaskService.getPartOverview(memberId, teamId, partId);
  }

  /** GET /api/v1/personal-tasks/team-overview — 팀원별 작업 건수 요약 (팀장/관리자 전용, 서비스에서 권한 체크) */
  @Get('team-overview')
  async getTeamOverview(
    @CurrentUser('id') memberId: string,
    @Query('teamId') teamId: string,
  ) {
    return this.personalTaskService.getTeamOverview(memberId, teamId);
  }

  /** PATCH /api/v1/personal-tasks/:id — 개인 작업 수정 */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') memberId: string,
    @Body() dto: UpdatePersonalTaskDto,
  ) {
    return this.personalTaskService.update(id, memberId, dto);
  }

  /** DELETE /api/v1/personal-tasks/:id — 개인 작업 소프트 삭제 */
  @Delete(':id')
  async softDelete(
    @Param('id') id: string,
    @CurrentUser('id') memberId: string,
  ) {
    return this.personalTaskService.softDelete(id, memberId);
  }

  /** PATCH /api/v1/personal-tasks/:id/toggle-done — 완료 상태 전환 */
  @Patch(':id/toggle-done')
  async toggleDone(
    @Param('id') id: string,
    @CurrentUser('id') memberId: string,
  ) {
    return this.personalTaskService.toggleDone(id, memberId);
  }
}

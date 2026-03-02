import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { MemberService } from './member.service';
import { TeamJoinService } from './team-join.service';
import { TeamProjectService } from './team-project.service';

@Module({
  controllers: [TeamController],
  providers: [TeamService, MemberService, TeamJoinService, TeamProjectService],
  exports: [TeamService, MemberService, TeamJoinService, TeamProjectService],
})
export class TeamModule {}

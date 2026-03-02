import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { MemberService } from './member.service';
import { TeamJoinService } from './team-join.service';

@Module({
  controllers: [TeamController],
  providers: [TeamService, MemberService, TeamJoinService],
  exports: [TeamService, MemberService, TeamJoinService],
})
export class TeamModule {}

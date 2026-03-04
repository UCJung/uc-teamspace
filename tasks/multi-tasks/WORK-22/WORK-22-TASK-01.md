# WORK-22-TASK-01: part-summary.service.ts 쿼리 TeamMembership 기반으로 전환

> **Phase:** 1
> **선행 TASK:** 없음
> **목표:** part-summary.service.ts에서 Member.partId를 직접 쿼리 조건으로 사용하는 5곳을 TeamMembership 기반으로 전환한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

part-summary.service.ts에는 Member.partId를 직접 필터 조건으로 사용하는 코드가 4곳 있으며, Part.members relation을 통해 Member.partId에 의존하는 코드가 2곳 있다. 이를 모두 TeamMembership 기반으로 전환한다. TASK-04(DB 마이그레이션) 이전 단계이므로 Member.partId 컬럼은 아직 존재하지만 코드에서의 읽기 참조를 제거한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/src/weekly-report/part-summary.service.ts |
| 수정 | packages/backend/src/weekly-report/part-summary.service.spec.ts |

### 1.3 변경 상세

**getPartWeeklyStatus (line 175-200)**

현재:
```
prisma.member.findMany({ where: { partId, isActive: true } })
```

변경 후:
```
// 1. TeamMembership에서 해당 파트 멤버 ID 조회
const memberships = await this.prisma.teamMembership.findMany({
  where: { partId, part: { teamId: ... } },
  select: { memberId: true, part: { select: { id: true, name: true, teamId: true } } }
});
// 2. memberIds로 WeeklyReport 조회
```

단 getPartWeeklyStatus에서는 partId만 받으므로 part.teamId를 먼저 조회 후 TeamMembership 필터.

**getPartSubmissionStatus (line 249-270)**

동일 패턴으로 변경.

**loadMemberRows - PART scope (line 384-385)**

현재:
```
memberFilter = { partId: summary.partId, isActive: true };
```

변경 후: TeamMembership에서 memberIds 조회 후 Member.id in 필터.

**getTeamMembersWeeklyStatus (line 203-247)**

현재: Part.members relation을 통해 Member.partId 기반으로 팀원 조회.
변경 후: TeamMembership을 통해 팀원 조회.

**getTeamWeeklyOverview (line 272-315)**

동일 패턴으로 변경.

---

## Step 2 - 체크리스트

### 2.1 getPartWeeklyStatus 수정
- [x] Part.teamId 조회 로직 추가
- [x] TeamMembership 기반 memberIds 조회로 전환
- [x] 응답 객체 partId/partName 필드 유지 (TeamMembership.part 기반)

### 2.2 getPartSubmissionStatus 수정
- [x] TeamMembership 기반 memberIds 조회로 전환
- [x] Member 조회 조건을 id in memberIds로 변경

### 2.3 loadMemberRows - PART scope memberFilter 수정
- [x] memberFilter를 Prisma.MemberWhereInput에서 memberIds 배열로 교체
- [x] TeamMembership 기반 memberIds 조회 로직 추가

### 2.4 getTeamMembersWeeklyStatus 수정
- [x] Part.members 대신 TeamMembership 기반으로 팀원 조회
- [x] 파트별 그룹화 로직 유지

### 2.5 getTeamWeeklyOverview 수정
- [x] Part.members 대신 TeamMembership 기반으로 팀원 조회
- [x] 파트별 그룹화 로직 유지

### 2.6 테스트
- [x] 단위 테스트: getPartWeeklyStatus TeamMembership 기반 조회 검증
- [x] 단위 테스트: getPartSubmissionStatus TeamMembership 기반 조회 검증
- [x] 단위 테스트: loadMemberRows PART scope TeamMembership 기반 조회 검증
- [x] bun run test 전체 통과

---

## Step 3 - 완료 검증

```bash
# 백엔드 단위 테스트
cd packages/backend && bun run test

# 전체 빌드 확인 (Member.partId 컬럼은 아직 존재하므로 빌드 성공해야 함)
bun run build
```

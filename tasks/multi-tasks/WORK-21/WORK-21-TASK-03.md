# WORK-21-TASK-03: 주간업무/취합보고 쿼리 최적화

> **Phase:** 2 (TASK-01과 병렬)
> **선행 TASK:** WORK-21-TASK-01
> **목표:** part-summary.service.ts, work-item.service.ts, team-join.service.ts의 쿼리 비효율 5건을 수정한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

1. ISSUE-03 (HIGH): 4단계 중첩 JOIN을 2단계 분리 쿼리로 변경.
2. ISSUE-05 (HIGH): 자동저장 시 중복 SELECT 제거.
3. ISSUE-17 (LOW): findById 불필요한 summaryWorkItems include 제거.
4. ISSUE-18 (LOW): 업무항목 추가 시 aggregate를 findFirst로 경량화.
5. ISSUE-20 (LOW): 권한 확인 2회 순차 조회를 Promise.all 병렬화.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/src/weekly-report/part-summary.service.ts |
| 수정 | packages/backend/src/weekly-report/work-item.service.ts |
| 수정 | packages/backend/src/team/team-join.service.ts |

### 1.3 변경 상세

ISSUE-03: getTeamMembersWeeklyStatus, getTeamWeeklyOverview

현재: Part.findMany + members: { include weeklyReports: { include workItems: { include project } } }
변경 후 (2단계):
  1단계: const parts = await prisma.part.findMany({ where: { teamId }, include: { members: { where: { isActive: true } } } });
         const memberIds = parts.flatMap(p => p.members.map(m => m.id));
  2단계: const reports = await prisma.weeklyReport.findMany({
           where: { memberId: { in: memberIds }, weekStart: start },
           include: { workItems: { include: { project: true }, orderBy: { sortOrder: 'asc' } } }
         });
         const reportMap = new Map(reports.map(r => [r.memberId, r]));
  조합: 기존 반환 구조 유지하며 reportMap에서 lookUp.

ISSUE-05: work-item.service.ts update

현재 코드:
  const workItem = await this.findWorkItemAndVerify(id, memberId);  // weeklyReport 포함 반환
  const report = await this.prisma.weeklyReport.findUnique({        // 중복 SELECT
    where: { id: workItem.weeklyReportId },
  });
  if (report?.status === ReportStatus.SUBMITTED) { ... }

변경 후:
  const workItem = await this.findWorkItemAndVerify(id, memberId);
  if (workItem.weeklyReport.status === ReportStatus.SUBMITTED) { ... }
  // weeklyReport.findUnique 제거

ISSUE-17: part-summary.service.ts findById

현재: include: { summaryWorkItems: true }
변경 후: select: { id: true, status: true, partId: true, teamId: true, weekStart: true, scope: true, weekLabel: true }
반환 타입 업데이트 필요.

ISSUE-18: work-item.service.ts create

현재:
  const maxOrder = await this.prisma.workItem.aggregate({
    where: { weeklyReportId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

변경 후:
  const last = await this.prisma.workItem.findFirst({
    where: { weeklyReportId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });
  const sortOrder = (last?.sortOrder ?? -1) + 1;

ISSUE-20: team-join.service.ts assertLeaderOrPartLeader

현재: teamMembership.findUnique -> 없으면 member.findUnique (최악 2회 순차)
변경 후:
  const [membership, member] = await Promise.all([
    this.prisma.teamMembership.findUnique({ where: { memberId_teamId: { memberId, teamId } } }),
    this.prisma.member.findUnique({ where: { id: memberId }, select: { roles: true } }),
  ]);
  // membership과 member를 함께 활용하여 단일 로직으로 처리

---

## Step 2 - 체크리스트

### 2.1 ISSUE-03 수정

- [ ] getTeamMembersWeeklyStatus 메서드 2단계 쿼리로 분리
  - 1단계: Part + Member 조회 (workItems 없이)
  - 2단계: WeeklyReport + WorkItem 일괄 조회
  - Map 조합으로 기존 반환 구조 유지
- [ ] getTeamWeeklyOverview 메서드 동일 방식 적용
  - partSummaries 조회는 별도 select로 유지

### 2.2 ISSUE-05 수정

- [ ] update 메서드에서 weeklyReport.findUnique 라인 제거
- [ ] workItem.weeklyReport.status 직접 참조로 변경
- [ ] findWorkItemAndVerify 반환값 타입 확인 (weeklyReport 포함 여부)

### 2.3 ISSUE-17 수정

- [ ] findById private 메서드의 include: { summaryWorkItems: true } 제거
- [ ] select로 필요 필드만 조회하도록 변경
- [ ] 반환 타입 변경에 따른 호출처 타입 오류 없음 확인
  - autoMerge, loadMemberRows, mergeRows, updateSummaryWorkItem, deleteSummaryWorkItem

### 2.4 ISSUE-18 수정

- [ ] create 메서드의 aggregate 호출을 findFirst로 교체
- [ ] 빈 보고서(첫 번째 항목 추가) 케이스 동작 확인 (findFirst null 시 -1 + 1 = 0)

### 2.5 ISSUE-20 수정

- [ ] assertLeaderOrPartLeader를 Promise.all 병렬 조회로 변경
- [ ] membership, member 둘 다 활용하여 권한 확인 로직 유지
- [ ] 기존 예외 메시지 동일하게 유지

### 2.6 빌드/린트

- [ ] bun run build 성공
- [ ] bun run lint 성공

---

## Step 3 - 완료 검증

```bash
cd packages/backend
bun run build
bun run lint
```

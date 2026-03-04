# WORK-21-TASK-02: timesheet-stats.service.ts CRITICAL/HIGH 최적화

> **Phase:** 2
> **선행 TASK:** WORK-21-TASK-01
> **목표:** timesheet-stats.service.ts의 CRITICAL/HIGH/MEDIUM 이슈 3건을 수정하여 쓰기 부수효과 제거 및 쿼리 효율을 개선한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

1. ISSUE-01 (CRITICAL): checkAndAutoApprove의 N회 개별 INSERT를 createMany 1회로 통합하고,
   GET 조회 API에서 쓰기 부수효과를 분리하여 POST 엔드포인트로 이전한다.
2. ISSUE-02 (HIGH): getTeamMembersStatus의 entries+workLogs 전량 로드를 필요 필드만 select로 변경한다.
3. ISSUE-11 (MEDIUM): getAdminOverview 내 독립 쿼리 2개를 Promise.all로 병렬화한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/src/timesheet/timesheet-stats.service.ts |
| 수정 | packages/backend/src/timesheet/timesheet.controller.ts |

### 1.3 변경 상세

ISSUE-01: checkAndAutoApprove 수정

현재 코드 (timesheet-stats.service.ts L587-L601):
  for (const ts of timesheets) {
    if (ts.approvals.length === 0) {
      await this.prisma.timesheetApproval.create({ ... });
    }
  }

변경 후:
  private async checkAndAutoApprove(projectId, yearMonth, approverId) {
    ...
    const toApprove = timesheets.filter(ts => ts.approvals.length === 0);
    if (toApprove.length > 0) {
      await this.prisma.timesheetApproval.createMany({
        data: toApprove.map(ts => ({ timesheetId: ts.id, approverId, approvalType: PROJECT_MANAGER, status: APPROVED, approvedAt: new Date(), autoApproved: true })),
        skipDuplicates: true,
      });
    }
  }

  getProjectAllocationMonthly에서 checkAndAutoApprove 호출 제거.
  triggerAutoApprove(projectId, yearMonth, approverId) public 메서드 추가 (checkAndAutoApprove 래핑).

  timesheet.controller.ts에 추가:
  @Post('auto-approve')
  @UseGuards(JwtAuthGuard)
  triggerAutoApprove(@Body() dto: { projectId: string; yearMonth: string }, @CurrentUser() user) { ... }

ISSUE-02: getTeamMembersStatus 수정

변경 전: entries: { include: { workLogs: true } }
변경 후: entries: { select: { attendance: true, workLogs: { select: { hours: true } } } }

ISSUE-11: getAdminOverview 병렬화

변경 전: projectsWithEntries 조회 후 순차로 pmApprovals 조회.
변경 후:
  const [projectsWithEntries, pmApprovals] = await Promise.all([
    this.prisma.timesheetWorkLog.findMany({ ... }),
    this.prisma.timesheetApproval.findMany({ ... }),
  ]);

---

## Step 2 - 체크리스트

### 2.1 ISSUE-01 수정

- [ ] checkAndAutoApprove 내 for 루프를 createMany로 전환
- [ ] skipDuplicates: true 설정 (@@unique([timesheetId, approvalType]) 충돌 방지)
- [ ] getProjectAllocationMonthly에서 checkAndAutoApprove 호출 라인 제거
- [ ] triggerAutoApprove public 메서드 추가 (private checkAndAutoApprove 래핑)
- [ ] TimesheetController에 POST auto-approve 엔드포인트 추가
  - Body: { projectId: string, yearMonth: string }
  - Guard: JwtAuthGuard + Roles(ADMIN, LEADER) 또는 PM 확인 로직

### 2.2 ISSUE-02 수정

- [ ] getTeamMembersStatus entries include를 select로 변경
- [ ] workLogs select에서 hours만 필요 (projectId 불필요 확인)
- [ ] 기존 로직(entry.workLogs.reduce) 동작 유지 확인

### 2.3 ISSUE-11 수정

- [ ] getAdminOverview 내 projectsWithEntries 조회 식별
- [ ] 후속 timesheetWorkLogs 조회 식별
- [ ] Promise.all로 두 독립 조회 병렬화

### 2.4 빌드/린트

- [ ] bun run build 성공
- [ ] bun run lint 성공

---

## Step 3 - 완료 검증

```bash
cd packages/backend
bun run build
bun run lint
```

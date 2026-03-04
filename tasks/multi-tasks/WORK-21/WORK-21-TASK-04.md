# WORK-21-TASK-04: 시간표/Admin 서비스 쿼리 최적화

> **Phase:** 3
> **선행 TASK:** WORK-21-TASK-01, WORK-21-TASK-02
> **목표:** timesheet-export, timesheet-entry, admin 서비스 쿼리 최적화 4건을 수정한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

1. ISSUE-07 (HIGH): 엑셀 생성 시 entries/approvals 전량 로드를 select 최소화로 변경.
2. ISSUE-13 (MEDIUM): batchSave의 N*2 쿼리를 deleteMany + createMany 통합으로 개선.
3. ISSUE-10 (MEDIUM): admin listTeams의 _count correlated subquery 제거.
4. ISSUE-06 (HIGH): reorder 메서드에 상한선 가드 추가.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/src/timesheet/timesheet-export.service.ts |
| 수정 | packages/backend/src/timesheet/timesheet-entry.service.ts |
| 수정 | packages/backend/src/admin/admin.service.ts |
| 수정 | packages/backend/src/weekly-report/work-item.service.ts |

### 1.3 변경 상세

ISSUE-07: timesheet-export.service.ts

현재 타입:
  type TimesheetWithDetail = Prisma.MonthlyTimesheetGetPayload<{
    include: { member, team, entries: { include: { workLogs: { include: { project } } } }, approvals: { include: { approver } } }
  }>;

변경 후 (select 기반):
  type TimesheetWithDetail = Prisma.MonthlyTimesheetGetPayload<{
    select: {
      member: { select: { id, name, position } },
      team: { select: { id, name } },
      status: true,
      submittedAt: true,
      entries: { select: { date, attendance, workLogs: { select: { hours, projectId, project: { select: { id, name, code } } } } } },
      approvals: { select: { approvalType, status, approvedAt, approver: { select: { id, name } } } }
    }
  }>;

  generateMonthlyExcel의 findMany도 select 방식으로 변경.

ISSUE-13: timesheet-entry.service.ts batchSave

현재: 트랜잭션 내 for...of 루프 N*2 쿼리.
변경 후:
  const results = await this.prisma.$transaction(async (tx) => {
    // 1. 전체 워크로그 일괄 삭제
    await tx.timesheetWorkLog.deleteMany({ where: { entryId: { in: entryIds } } });

    // 2. attendance 업데이트 병렬화
    await Promise.all(dto.entries.map(e =>
      tx.timesheetEntry.update({ where: { id: e.entryId }, data: { attendance: e.attendance as AttendanceType } })
    ));

    // 3. 새 워크로그 일괄 삽입
    const allWorkLogs = dto.entries.flatMap(e =>
      (e.workLogs ?? []).map(wl => ({
        entryId: e.entryId, projectId: wl.projectId, hours: wl.hours, workType: wl.workType as WorkType
      }))
    );
    if (allWorkLogs.length > 0) {
      await tx.timesheetWorkLog.createMany({ data: allWorkLogs });
    }

    // 4. 결과 재조회 (createMany는 생성된 row 미반환)
    return tx.timesheetEntry.findMany({
      where: { id: { in: entryIds } },
      include: { workLogs: { include: { project: { select: { id, name, code } } } } },
    });
  });
  return results;

ISSUE-10: admin.service.ts listTeams

현재:
  _count: { select: { teamMemberships: { where: { member: { accountStatus: 'ACTIVE' } } } } }

변경 후:
  _count: { select: { teamMemberships: true } }
  (memberCount는 전체 멤버 수로 의미 변경, 관리자 화면에서 실용적)

ISSUE-06: work-item.service.ts reorder

현재: 상한선 없이 N개 업데이트.
변경 후 (메서드 시작부):
  if (dto.items.length > 50) {
    throw new BusinessException(
      'REORDER_LIMIT_EXCEEDED',
      '정렬 항목은 최대 50개까지 가능합니다.',
      HttpStatus.BAD_REQUEST,
    );
  }
  // NOTE: Prisma의 updateMany는 모든 행에 동일한 값만 설정 가능하여,
  // 행별로 다른 sortOrder 지정 시 개별 update가 필요합니다. (배치 upsert 제약)

---

## Step 2 - 체크리스트

### 2.1 ISSUE-07 수정

- [ ] TimesheetWithDetail 타입을 select 기반으로 변경
- [ ] generateMonthlyExcel의 findMany를 select 방식으로 변경
  - entries: date, attendance, workLogs(hours, projectId, project(id,name,code))
  - approvals: approvalType, status, approvedAt, approver(id, name)
- [ ] buildSummarySheet, buildProjectMatrixSheet 동작 확인 (접근 필드 변경 없음)
- [ ] TypeScript 타입 오류 없음 확인

### 2.2 ISSUE-13 수정

- [ ] batchSave 트랜잭션 내 로직 교체
  - deleteMany({ entryId: { in: entryIds } })
  - Promise.all(update attendance)
  - createMany(allWorkLogs)
  - findMany 재조회 반환
- [ ] 반환 타입이 기존과 동일함을 확인 (TimesheetEntry with workLogs)
- [ ] 빈 workLogs 케이스 처리 (createMany 빈 배열 방지)

### 2.3 ISSUE-10 수정

- [ ] admin.service.ts listTeams의 _count where 조건 제거
- [ ] 응답 필드 memberCount 유지 (값은 전체 멤버 수로 변경)

### 2.4 ISSUE-06 수정

- [ ] work-item.service.ts reorder 메서드 시작부에 상한선 가드 추가
- [ ] BusinessException 에러코드: REORDER_LIMIT_EXCEEDED
- [ ] 코드 주석으로 배치 upsert 미적용 사유 명시

### 2.5 빌드/린트/테스트

- [ ] bun run build 성공
- [ ] bun run lint 성공
- [ ] bun run test 성공

---

## Step 3 - 완료 검증

```bash
cd packages/backend
bun run build
bun run lint
bun run test
```

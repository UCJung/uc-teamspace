# WORK-20-TASK-01: Backend 공통 유틸 추출 및 코드 재사용성 개선

> **Phase:** 1
> **선행 TASK:** 없음
> **목표:** week-utils 로컬 복사본을 shared 패키지로 일원화하고, pagination 및 reorder 반복 패턴을 공통 유틸 함수로 추출하여 코드 재사용성을 높인다.

---

## Step 1 — 계획서

### 1.1 작업 범위

`packages/backend/src/weekly-report/week-utils.ts`는 shared 패키지와 완전히 동일한 로직을 복사 유지하고 있다. 이 파일을 삭제하고 4개 서비스가 shared 패키지를 직접 import하도록 수정한다.

페이지네이션 관련 `page/limit/skip` 계산 패턴이 admin.service.ts(3회), team-join.service.ts(1회), project.service.ts(1회)에 중복되어 있고, 응답 조립 패턴도 4곳에서 반복된다. 이를 `common/utils/pagination.util.ts`로 추출한다.

`orderedIds.map((id, index) => prisma.X.update({sortOrder: index}))` 패턴이 team.service.ts, member.service.ts, team-project.service.ts, project.service.ts, work-item.service.ts 5곳에서 반복된다. 이를 `common/utils/reorder.util.ts` 헬퍼로 추출한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| DELETE | packages/backend/src/weekly-report/week-utils.ts |
| CREATE | packages/backend/src/common/utils/pagination.util.ts |
| CREATE | packages/backend/src/common/utils/reorder.util.ts |
| CREATE | packages/backend/src/common/utils/pagination.util.spec.ts |
| MODIFY | packages/backend/src/admin/admin.service.ts |
| MODIFY | packages/backend/src/team/team-join.service.ts |
| MODIFY | packages/backend/src/project/project.service.ts |
| MODIFY | packages/backend/src/team/team.service.ts |
| MODIFY | packages/backend/src/team/member.service.ts |
| MODIFY | packages/backend/src/team/team-project.service.ts |
| MODIFY | packages/backend/src/weekly-report/work-item.service.ts |
| MODIFY | packages/backend/src/weekly-report/report.service.ts |
| MODIFY | packages/backend/src/weekly-report/part-summary.service.ts |
| MODIFY | packages/backend/src/weekly-report/carry-forward.service.ts |
| MODIFY | packages/backend/src/export/excel.service.ts |

---

## Step 2 — 체크리스트

### 2.1 week-utils 통합

- [ ] `packages/backend/src/weekly-report/week-utils.ts` 파일 내용 확인 및 shared 패키지와 동일한지 검증
- [ ] `packages/shared/constants/week-utils.ts`가 export하는 함수 목록 파악
- [ ] `report.service.ts`: 로컬 week-utils import를 `@uc-teamspace/shared/constants/week-utils` 경로로 교체
- [ ] `part-summary.service.ts`: 로컬 week-utils import를 shared 경로로 교체
- [ ] `carry-forward.service.ts`: 로컬 week-utils import를 shared 경로로 교체
- [ ] `excel.service.ts`: 로컬 week-utils import를 shared 경로로 교체
- [ ] `packages/backend/src/weekly-report/week-utils.ts` 파일 삭제

### 2.2 pagination.util.ts 생성

- [ ] `packages/backend/src/common/utils/pagination.util.ts` 파일 생성
  - `parsePagination(page, limit): { skip, take, page, limit }` 함수 구현 (page/limit 기본값, skip 계산)
  - `buildPaginationResponse<T>(data: T[], total: number, page: number, limit: number)` 함수 구현
- [ ] `admin.service.ts`의 `listAccounts` 메서드: parsePagination, buildPaginationResponse 유틸 적용
- [ ] `admin.service.ts`의 `listTeams` 메서드: 동일 유틸 적용
- [ ] `admin.service.ts`의 `listProjects` 메서드: 동일 유틸 적용
- [ ] `team-join.service.ts`: listJoinRequests 페이지네이션 유틸 적용
- [ ] `project.service.ts`: 페이지네이션 유틸 적용 (해당하는 경우)

### 2.3 reorder.util.ts 생성

- [ ] `packages/backend/src/common/utils/reorder.util.ts` 파일 생성
  - `buildReorderOps<T>(prismaModel, orderedIds: string[], extraFields?: Record<string, unknown>)` 또는 `createReorderUpdates(orderedIds: string[], updateFn: (id, index) => Promise<unknown>)` 형태로 설계
  - Prisma `$transaction` 배열 방식으로 일괄 처리하는 헬퍼 구현
- [ ] `team.service.ts` reorderParts 메서드: reorder 유틸 적용
- [ ] `member.service.ts` reorder 메서드: reorder 유틸 적용
- [ ] `team-project.service.ts` reorder 메서드: reorder 유틸 적용
- [ ] `project.service.ts` reorder 메서드: reorder 유틸 적용
- [ ] `work-item.service.ts` reorder 메서드: reorder 유틸 적용

### 2.4 테스트

- [ ] `packages/backend/src/common/utils/pagination.util.spec.ts` 작성
  - parsePagination: 기본값(page=1, limit=20), skip 계산 정확성, 음수/0 입력 처리
  - buildPaginationResponse: totalPages 계산, data 포함 여부
- [ ] `bun run test` 실행하여 기존 테스트 + 신규 테스트 모두 통과 확인
- [ ] `bun run build` 실행하여 빌드 오류 0건 확인

---

## Step 3 — 완료 검증

```bash
# 1. week-utils 로컬 파일이 삭제되었는지 확인
ls packages/backend/src/weekly-report/week-utils.ts 2>/dev/null && echo "FAIL: 파일이 아직 존재함" || echo "OK: 파일 삭제 확인"

# 2. 로컬 week-utils import가 남아있는지 확인 (결과 없어야 통과)
grep -r "from.*week-utils" packages/backend/src --include="*.ts" | grep -v "spec.ts"

# 3. pagination 유틸 생성 확인
ls packages/backend/src/common/utils/pagination.util.ts && echo "OK: pagination.util.ts 존재"
ls packages/backend/src/common/utils/reorder.util.ts && echo "OK: reorder.util.ts 존재"

# 4. 유틸 단위 테스트 실행
cd packages/backend && bun run test --testPathPattern="pagination.util"

# 5. 전체 테스트 및 빌드
cd packages/backend && bun run test && bun run build
```

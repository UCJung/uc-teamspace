# WORK-19-TASK-06: 프로젝트투입현황 목록에 승인여부 컬럼 추가

> **Phase:** 기능개선
> **선행 TASK:** TASK-05
> **목표:** 프로젝트투입현황 > 프로젝트 목록 테이블에 승인여부를 표시하여 PM이 어떤 프로젝트를 승인해야 하는지 쉽게 파악할 수 있게 한다

## 요청사항
프로젝트투입현황 > 프로젝트 목록의 열에 승인여부를 표시해서 승인할 프로젝트를 알 수 있게 해줘

---

## Step 1 — 계획서

### 1.1 현황 분석

- **프론트엔드**: `ProjectAllocation.tsx`의 프로젝트 목록 테이블에는 프로젝트명, 총 투입인원, 총 투입시간, 평균 투입시간 4개 컬럼만 존재
- **API 응답**: `ProjectAllocationSummaryItem` 인터페이스에 승인 관련 필드 없음
- **백엔드**: `getProjectAllocationSummary` 메서드에서 `TimesheetApproval` 테이블을 조회하지 않음
- **승인 모델**: `TimesheetApproval` 테이블 — `approvalType: PROJECT_MANAGER`로 PM 승인 기록, `@@unique([timesheetId, approvalType])`

### 1.2 구현 방안

1. 백엔드 `getProjectAllocationSummary`에서 해당 yearMonth의 각 프로젝트별 PM 승인 여부를 조회
   - 프로젝트에 투입된 멤버들의 timesheet 중 PM 승인(`approvalType: PROJECT_MANAGER`)이 존재하는지 확인
   - 응답에 `pmApprovalStatus: 'APPROVED' | 'NOT_APPROVED'` 필드 추가
2. 프론트엔드 `ProjectAllocationSummaryItem` 인터페이스에 `pmApprovalStatus` 필드 추가
3. 프로젝트 목록 테이블에 "승인여부" 컬럼 추가 — Badge로 표시

### 1.3 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/backend/src/timesheet/timesheet-stats.service.ts` — `getProjectAllocationSummary`에 승인여부 조회 추가 |
| 수정 | `packages/frontend/src/api/timesheet.api.ts` — `ProjectAllocationSummaryItem`에 `pmApprovalStatus` 필드 |
| 수정 | `packages/frontend/src/pages/ProjectAllocation.tsx` — 프로젝트 목록 테이블에 승인여부 컬럼 |

---

## Step 2 — 체크리스트

### 2.1 백엔드
- [ ] `getProjectAllocationSummary`에서 각 프로젝트별 PM 승인 여부 조회
- [ ] 응답 객체에 `pmApprovalStatus` 필드 추가

### 2.2 프론트엔드
- [ ] `ProjectAllocationSummaryItem`에 `pmApprovalStatus` 필드 추가
- [ ] 프로젝트 목록 테이블 헤더에 "승인여부" 컬럼 추가
- [ ] 승인여부를 Badge로 표시 (승인완료: ok 색상, 미승인: warn 색상)

### 2.3 검증
- [ ] 빌드 0 에러

---

## Step 3 — 완료 검증

```bash
bun run build
```

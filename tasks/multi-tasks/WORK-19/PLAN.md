# WORK-19 계획서

> WORK: 근무시간표 기능 개선 (Require-07)
> 작성일: 2026-03-04
> 요구사항: tasks/Require/Require-07.md

---

## 1. 개요

1차 개발된 월별 근무시간표의 사용자 검증 피드백 개선 — 팀 근무시간 검토 화면(필터링, 목록 개선, 팝업, 일괄승인)과 대시보드(주간업무보고/근무시간표 토글)를 개선한다.

---

## 2. TASK 분해

| TASK | Title | Depends | 비고 |
|------|-------|---------|------|
| TASK-01 | 백엔드 — 팀원현황 API 파트정보 추가 + 일괄승인 API | — | |
| TASK-02 | 팀 근무시간 검토 — 필터/목록/카운트 개선 | TASK-01 | |
| TASK-03 | 팀 근무시간 검토 — 행선택 시간표 팝업 + 일괄승인 + 액션열 | TASK-01, TASK-02 | |
| TASK-04 | 대시보드 — 주간업무보고/근무시간표 토글 + 카드 필터링 | TASK-01 | TASK-02와 병렬 가능 |

### 의존성 DAG

```
TASK-01 ──┬──→ TASK-02 ──→ TASK-03
          └──→ TASK-04 (병렬)
```

---

## 3. TASK 상세

### TASK-01: 백엔드 — 팀원현황 API 파트정보 추가 + 일괄승인 API

**수정 파일:**
- `packages/backend/src/timesheet/timesheet-stats.service.ts` — getTeamMembersStatus에 partId, partName, jobTitle 추가
- `packages/backend/src/timesheet/timesheet.controller.ts` — PART_LEADER 접근 허용, 일괄승인 엔드포인트 추가
- `packages/backend/src/timesheet/timesheet-approval.service.ts` — batchLeaderApprove 메서드 추가
- `packages/frontend/src/api/timesheet.api.ts` — TeamMemberStatusRow에 partId, partName, jobTitle 추가, batchApprove API 추가
- `packages/frontend/src/hooks/useTimesheet.ts` — useBatchApprove 훅 추가

**체크리스트:**
- [ ] getTeamMembersStatus 응답에 partId, partName, jobTitle(직책) 필드 추가
- [ ] getTeamMembersStatus에 PART_LEADER 역할 접근 허용
- [ ] POST /timesheets/batch-approve { timesheetIds: string[] } 신규 엔드포인트
- [ ] batchLeaderApprove 서비스 메서드 (트랜잭션)
- [ ] 프론트 TeamMemberStatusRow 인터페이스 확장
- [ ] 프론트 batchApprove API + useBatchApprove 훅
- [ ] 빌드 0 에러

---

### TASK-02: 팀 근무시간 검토 — 필터/목록/카운트 개선

**수정 파일:**
- `packages/frontend/src/pages/TeamTimesheetReview.tsx`

**체크리스트:**
- [ ] 툴바에 파트 선택 드롭다운 (기본값: 전체)
- [ ] 파트 선택 시 팀원 선택 드롭다운 연동
- [ ] 제출현황 테이블 컬럼 순서: 성명, 직급, 파트, 직책, 상태, 총근무시간, 근무일수, 제출일, 팀장승인, 액션
- [ ] 매트릭스 테이블도 이름 열에 직급/파트/직책 추가
- [ ] "팀원 제출현황" 타이틀 우측: 총원 N명 · 제출 N명 · 미제출 N명
- [ ] 빌드 0 에러

---

### TASK-03: 팀 근무시간 검토 — 행선택 시간표 팝업 + 일괄승인 + 액션열

**수정 파일:**
- `packages/frontend/src/pages/TeamTimesheetReview.tsx`

**체크리스트:**
- [ ] 행 클릭 시 전체화면 레이어 팝업 (ESC 또는 우측 상단 X 닫기)
- [ ] 팝업: 선택된 팀원의 개인 근무시간표 표시 (getTimesheetById API 활용, 읽기전용)
- [ ] 체크박스 다중 선택 + 상단 "일괄 승인" 버튼 (SUBMITTED 상태만 선택 가능)
- [ ] 액션 열: 우측 정렬, 고정 너비 (w-[120px])
- [ ] 액션 열 클릭 시 행 선택 이벤트 전파 차단 (e.stopPropagation)
- [ ] 빌드 0 에러

---

### TASK-04: 대시보드 — 주간업무보고/근무시간표 토글 + 카드 필터링

**수정 파일:**
- `packages/frontend/src/pages/Dashboard.tsx`

**체크리스트:**
- [ ] 상단 배너: "주간업무보고" / "근무시간표" 탭 토글 (기본값: 주간업무보고)
- [ ] 주간업무보고 선택 시: 주차 선택 + 기존 컨텐츠
  - [ ] 타이틀: "팀원 작성현황 - 주간업무보고"
  - [ ] 컬럼 순서: 성명, 직급, 파트, 직책, 이하 기존 동일
- [ ] 근무시간표 선택 시: 월 선택 + 시간표 컨텐츠
  - [ ] 집계카드: 전체, 제출, 미제출, 작성중(임시저장), 미작성 — 5개 카드
  - [ ] 타이틀: "팀원 작성현황 - 근무시간표"
  - [ ] 목록: 팀 근무시간표 검토의 팀원제출현황과 동일 표시
- [ ] 카드 클릭 → 목록 필터링 (선택/해제 토글)
- [ ] 빌드 0 에러

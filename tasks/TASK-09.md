# TASK-09: Front-end — 파트 현황·취합보고·팀장 조회 화면

> **Phase:** 9
> **선행 TASK:** TASK-08, TASK-05
> **목표:** 파트장용 파트 현황·취합보고 화면, 팀장용 전체 조회 화면, 대시보드, Excel 내보내기 UI 구현

---

## Step 1 — 계획서

### 1.1 작업 범위

파트장 전용 화면(PartStatus, PartSummary)과 팀장 전용 화면(TeamStatus)을 구현한다. 파트 업무 현황은 읽기 전용 그리드로 파트원 업무를 조회하고, 파트 취합보고는 편집 가능한 그리드(자동 취합 + 수동 편집)를 제공한다. 팀장용 화면은 전체 파트 업무를 조회하고 Excel 내보내기를 지원한다. 대시보드에 작성 현황 요약을 표시한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| API | `api/part.api.ts`, `api/export.api.ts` |
| Pages | `pages/PartStatus.tsx`, `pages/PartSummary.tsx`, `pages/TeamStatus.tsx`, `pages/Dashboard.tsx` |

---

## Step 2 — 체크리스트

### 2.1 API 클라이언트

- [ ] `api/part.api.ts`
  - getPartWeeklyStatus(partId, week) — 파트원 업무 현황
  - getSubmissionStatus(partId, week) — 파트원 작성 현황
  - getPartSummary(partId, week) — 파트 취합보고 조회
  - createPartSummary(data) — 파트 취합보고 생성
  - autoMerge(summaryId) — 자동 취합
  - updatePartSummary(id, data) — 취합보고 수정·제출
  - getTeamWeeklyOverview(teamId, week) — 팀 전체 현황
- [ ] `api/export.api.ts`
  - downloadExcel(type, partId?, week) — Excel 파일 다운로드 (Blob)

### 2.2 파트 업무 현황 (PartStatus.tsx) — 파트장/팀장용

- [ ] 주차 선택기
- [ ] 읽기 전용 그리드 (TanStack Table)
  - 컬럼: 파트(5%), 성명(7%), 프로젝트명(10%), 프로젝트코드(7%), 진행업무(28%), 예정업무(28%), 비고(15%)
  - 동일 팀원 연속 행의 파트·성명 셀 병합 표시
  - 구조화 서식 렌더링 (FormattedText 재사용)
- [ ] 필터 바: 프로젝트 필터, 팀원 필터
- [ ] 하단 작성 현황 바: 각 파트원별 상태 표시 (✅제출 / 📝임시저장 / ❌미작성)
- [ ] PART_LEADER: 소속 파트만 표시 / LEADER: 파트 선택 드롭다운
- [ ] Excel 내보내기 버튼

### 2.3 파트 취합보고 (PartSummary.tsx) — 파트장 전용

- [ ] 주차 선택기
- [ ] [자동 취합] 버튼 → auto-merge API 호출 → 그리드 반영
- [ ] 편집 가능한 그리드 (EditableGrid 재사용)
  - 컬럼: 프로젝트명, 프로젝트코드, 진행업무, 예정업무, 비고
  - 자동 취합 결과를 편집·보완 가능
- [ ] 행 추가/삭제
- [ ] [임시저장], [제출] 버튼
- [ ] 제출 확인 다이얼로그
- [ ] 상태 배지 (DRAFT / SUBMITTED)
- [ ] 자동 취합 시 기존 항목 대체 확인 다이얼로그

### 2.4 팀 업무 현황 (TeamStatus.tsx) — 팀장 전용

- [ ] 주차 선택기
- [ ] 파트별 탭 또는 필터 (DX / AX / 전체)
- [ ] 읽기 전용 그리드 (전체 팀원 업무)
  - 파트 업무 현황과 동일 컬럼 구조
  - 파트별 그룹핑 또는 파트 컬럼 표시
- [ ] 파트 취합보고 조회 영역
  - 각 파트의 취합보고서 내용 표시
  - 취합 상태 배지
- [ ] 작성 현황 요약: 전체 인원 대비 제출 현황
- [ ] Excel 내보내기 (팀 전체)

### 2.5 대시보드 (Dashboard.tsx)

- [ ] 요약 카드 (4열 그리드)
  - 전체 팀원 수
  - 이번 주 제출 인원 / 전체
  - 파트 취합 현황 (DX/AX 제출 여부)
  - 미제출 인원 수
- [ ] 빠른 진입 링크
  - 팀원: "내 주간업무 작성하기" 버튼
  - 파트장: "파트 취합하기" 버튼
  - 팀장: "팀 현황 보기" 버튼
- [ ] 최근 주간업무 작성 이력 (최근 4주)
- [ ] 역할별 다른 정보 표시

### 2.6 Excel 내보내기 UI

- [ ] 파트 현황 → [Excel 내보내기] 버튼 클릭 → Blob 다운로드
- [ ] 팀 현황 → [Excel 내보내기] 버튼 클릭 → Blob 다운로드
- [ ] 다운로드 중 로딩 표시
- [ ] 파일명: `{파트명}_{주차}.xlsx` 또는 `팀전체_{주차}.xlsx`

### 2.7 RBAC 적용

- [ ] PartStatus: PART_LEADER(소속 파트), LEADER(전체)
- [ ] PartSummary: PART_LEADER만
- [ ] TeamStatus: LEADER만
- [ ] 사이드바 메뉴 역할별 표시/숨김 최종 확인

### 2.8 테스트

- [ ] 컴포넌트 테스트: PartStatus 읽기 전용 그리드 렌더링
- [ ] 컴포넌트 테스트: Dashboard 요약 카드 렌더링
- [ ] 컴포넌트 테스트: Excel 다운로드 버튼 동작
- [ ] 빌드 성공 확인

---

## Step 3 — 완료 검증

```bash
# 1. Frontend 빌드
cd packages/frontend && bun run build

# 2. 린트
cd packages/frontend && bun run lint

# 3. 테스트
cd packages/frontend && bun run test

# 4. 전체 빌드
cd ../.. && bun run build

# 5. 전체 린트
bun run lint

# 6. 수동 확인 필요 항목:
# - 파트장 로그인 → /part-status → 파트원 업무 그리드 표시
# - 파트장 로그인 → /part-summary → 자동 취합 → 편집 → 제출
# - 팀장 로그인 → /team-status → 전체 업무 조회 + 파트 필터
# - 팀장 로그인 → 대시보드 요약 카드 정보 정확성
# - Excel 내보내기 다운로드 + 파일 내용 확인
# - 역할별 메뉴 접근 제한 동작
```

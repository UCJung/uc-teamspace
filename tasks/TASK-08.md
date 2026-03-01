# TASK-08: Front-end — 주간업무 작성 그리드 화면 (핵심)

> **Phase:** 8
> **선행 TASK:** TASK-07, TASK-04
> **목표:** TanStack Table 기반 스프레드시트 그리드 UI로 주간업무 작성 화면 구현 — 인라인 셀 편집, 자동저장, 전주 불러오기, 구조화 서식

---

## Step 1 — 계획서

### 1.1 작업 범위

시스템의 핵심 화면인 주간업무 작성 그리드(MyWeeklyReport)를 구현한다. TanStack Table v8 기반의 편집 가능한 스프레드시트 그리드에서 인라인 셀 편집, 자동저장(debounce 500ms + 낙관적 업데이트), 전주 예정업무 불러오기 모달, 구조화 서식 렌더링([항목]/*세부/ㄴ상세)을 완성한다. Zustand gridStore로 그리드 편집 상태를 관리하고, 키보드 네비게이션(Tab, 방향키)을 지원한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| API | `api/weekly-report.api.ts` |
| Hooks | `hooks/useWeeklyReport.ts`, `hooks/useWorkItems.ts` |
| Store | `stores/gridStore.ts` |
| Grid | `components/grid/EditableGrid.tsx`, `GridCell.tsx`, `ExpandedEditor.tsx`, `FormattedText.tsx`, `ProjectDropdown.tsx` |
| Page | `pages/MyWeeklyReport.tsx`, `pages/MyHistory.tsx` |

---

## Step 2 — 체크리스트

### 2.1 API 클라이언트

- [ ] `api/weekly-report.api.ts`
  - getMyWeeklyReport(week) — 내 주간업무 조회
  - createWeeklyReport(weekLabel) — 주간업무 생성
  - updateWeeklyReport(id, status) — 상태 변경
  - addWorkItem(reportId, data) — 업무항목 추가
  - updateWorkItem(id, data) — 업무항목 수정 (자동저장)
  - deleteWorkItem(id) — 업무항목 삭제
  - reorderWorkItems(items) — 순서 변경
  - carryForward(targetWeek, sourceIds?) — 전주 불러오기

### 2.2 TanStack Query 훅

- [ ] `hooks/useWeeklyReport.ts`
  - useMyWeeklyReport(week) — 주간업무 쿼리
  - useCreateWeeklyReport() — 생성 뮤테이션
  - useSubmitWeeklyReport() — 제출 뮤테이션
  - useCarryForward() — 전주 불러오기 뮤테이션
- [ ] `hooks/useWorkItems.ts`
  - useAddWorkItem() — 추가 뮤테이션 (캐시 즉시 업데이트)
  - useUpdateWorkItem() — 수정 뮤테이션 (낙관적 업데이트 + 롤백)
  - useDeleteWorkItem() — 삭제 뮤테이션
  - debounce 500ms 적용

### 2.3 Zustand gridStore

- [ ] `stores/gridStore.ts`
  - focusedCell: { rowIndex, columnId } | null
  - editingValue: string | null
  - dirtyMap: Map<string, Partial<WorkItem>> — 미저장 변경 추적
  - setFocusedCell, setEditingValue, markDirty, markClean 액션
  - isSaving: boolean — 저장 중 표시

### 2.4 그리드 컴포넌트

- [ ] `components/grid/EditableGrid.tsx`
  - TanStack Table v8 기반 편집 가능 그리드
  - 컬럼 정의: 프로젝트명(12%), 프로젝트코드(8%), 진행업무(30%), 예정업무(30%), 비고(20%)
  - 행 추가 (+행 추가 버튼)
  - 행 삭제 (확인 후)
  - 고정 헤더 (스크롤 시 상단 고정)
  - 셀 자동 높이 조절 (내용 줄 수에 따라)

- [ ] `components/grid/GridCell.tsx`
  - 읽기 모드: FormattedText로 구조화 서식 렌더링
  - 편집 모드: textarea 인라인 편집 (클릭/Enter로 진입)
  - onBlur 시 자동저장 트리거
  - 멀티라인 입력 지원 (Enter = 줄바꿈)

- [ ] `components/grid/ExpandedEditor.tsx`
  - F2 또는 확대 아이콘으로 열기
  - 그리드 하단에 넓은 편집 영역 표시
  - 편집 완료 시 그리드 셀에 반영

- [ ] `components/grid/FormattedText.tsx`
  - `[텍스트]` → 볼드, Primary 색상
  - `*텍스트` → 불릿(•) 변환, 1단 들여쓰기
  - `ㄴ텍스트` → 2단 들여쓰기, 보조 텍스트 색상
  - 줄바꿈 기준으로 라인별 파싱·렌더링

- [ ] `components/grid/ProjectDropdown.tsx`
  - 등록된 ACTIVE 프로젝트 목록 드롭다운
  - 프로젝트 선택 시 코드 자동 채움
  - 검색 필터 기능

### 2.5 키보드 네비게이션

- [ ] Tab → 다음 셀 이동 (행 끝에서 다음 행 첫 편집 셀)
- [ ] Shift+Tab → 이전 셀 이동
- [ ] Enter → 편집 모드 진입 / 편집 중 줄바꿈
- [ ] Esc → 편집 취소, 일반 모드 복귀
- [ ] Ctrl+Enter → 편집 확정 후 다음 행 동일 컬럼 이동
- [ ] F2 → 확대 편집 패널 열기/닫기
- [ ] Ctrl+D → 현재 행 복제
- [ ] Ctrl+Delete → 현재 행 삭제 (확인 후)
- [ ] 방향키 (↑↓←→) → 편집 모드 아닐 때 인접 셀 이동

### 2.6 자동저장 흐름

- [ ] 셀 편집 완료 (onBlur) → gridStore 즉시 업데이트
- [ ] Debounce 500ms → PATCH /api/v1/work-items/:id
- [ ] 낙관적 업데이트: TanStack Query 캐시 즉시 반영
- [ ] 실패 시 롤백 + 토스트 알림
- [ ] 저장 중 표시 (헤더 영역에 "저장 중..." / "저장 완료")

### 2.7 주간업무 작성 페이지 (MyWeeklyReport.tsx)

- [ ] 주차 선택기: ◀ 이전주 / 현재주 표시 / 다음주 ▶
- [ ] 주차 표시: "2026년 9주차 (2/23 ~ 2/27)" 형식
- [ ] 버튼: [전주 할일 불러오기], [임시저장], [제출]
- [ ] 해당 주차 WeeklyReport 존재 시 → 그리드에 WorkItem 로드
- [ ] 해당 주차 WeeklyReport 미존재 시 → 생성 유도 (자동 생성 또는 불러오기 모달)
- [ ] 제출 확인 다이얼로그 (빈 행 자동 제거 안내)
- [ ] 상태 표시 배지 (DRAFT / SUBMITTED)
- [ ] SUBMITTED 상태에서 편집 비활성화 + 재편집 버튼

### 2.8 전주 할일 불러오기 모달

- [ ] 전주 WorkItem 목록 표시 (프로젝트명 + planWork 미리보기)
- [ ] 항목별 체크박스 (개별 선택/해제)
- [ ] 전체 선택 / 전체 해제 버튼
- [ ] [불러오기] → carry-forward API 호출 → 그리드 반영
- [ ] [건너뛰기] → 빈 주간업무 생성
- [ ] 전주 업무 없을 경우 안내 메시지

### 2.9 내 업무 이력 (MyHistory.tsx)

- [ ] 주차별 주간업무 목록 (테이블)
- [ ] 각 주차 클릭 시 해당 주차 MyWeeklyReport로 이동
- [ ] 상태 배지, 업무항목 수 표시

### 2.10 테스트

- [ ] 컴포넌트 테스트: FormattedText 서식 파싱
- [ ] 컴포넌트 테스트: GridCell 편집 모드 전환
- [ ] 컴포넌트 테스트: ProjectDropdown 선택
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
# - 브라우저에서 /my-weekly 접근
# - 주차 선택기 ◀ ▶ 동작
# - 그리드 셀 클릭 → 인라인 편집 진입 → 자동저장 동작
# - Tab/Shift+Tab/방향키로 셀 이동
# - F2로 확대 편집 패널 열기/닫기
# - [항목]/*세부/ㄴ상세 구조화 서식 렌더링 확인
# - 프로젝트 드롭다운 선택 → 코드 자동 채움
# - + 행 추가 / 행 삭제 동작
# - 전주 할일 불러오기 모달 동작
# - 제출 → SUBMITTED 상태 전환 → 편집 비활성화
```

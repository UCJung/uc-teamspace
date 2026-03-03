# WORK-18-TASK-06: 프론트엔드 — 근무시간표 작성 페이지

> **Phase:** 4
> **선행 TASK:** TASK-03
> **목표:** 팀원이 월별 근무시간표를 작성하는 프론트엔드 페이지와 API/Hook을 구현한다

---

## Step 1 — 계획서

### 1.1 작업 범위

타임시트 API 클라이언트와 TanStack Query 훅을 생성하고, MyTimesheet 페이지(달력 그리드 UI)를 구현한다. 일별 근태 선택, 프로젝트별 투입시간/업무방식 입력, 실시간 합계 검증, 자동저장, 제출 기능을 포함한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| API | `src/api/timesheet.api.ts` — 시간표 CRUD API 클라이언트 |
| Hook | `src/hooks/useTimesheet.ts` — TanStack Query 커스텀 훅 |
| Page | `src/pages/MyTimesheet.tsx` — 달력 그리드 작성 화면 |
| Router | `src/App.tsx` — `/timesheet` 라우트 추가 |
| Layout | `src/components/layout/Sidebar.tsx` — 근무시간표 메뉴 추가 |

---

## Step 2 — 체크리스트

### 2.1 API 클라이언트

- [ ] `timesheet.api.ts`: createTimesheet(yearMonth, teamId)
- [ ] `timesheet.api.ts`: getMyTimesheet(yearMonth, teamId)
- [ ] `timesheet.api.ts`: getTimesheetById(id)
- [ ] `timesheet.api.ts`: saveEntry(entryId, data)
- [ ] `timesheet.api.ts`: batchSaveEntries(entries)
- [ ] `timesheet.api.ts`: submitTimesheet(id)

### 2.2 TanStack Query 훅

- [ ] `useMyTimesheet(yearMonth, teamId)` — 시간표 조회 (staleTime: 30s)
- [ ] `useCreateTimesheet()` — 시간표 생성 mutation
- [ ] `useSaveEntry()` — 엔트리 저장 mutation (낙관적 업데이트)
- [ ] `useBatchSaveEntries()` — 배치 저장 mutation
- [ ] `useSubmitTimesheet()` — 제출 mutation

### 2.3 MyTimesheet.tsx 페이지

- [ ] 월 선택 UI (이전/다음 월 탐색, 현재 월 기본값)
- [ ] 시간표 자동 생성 (해당 월 처음 접근 시)
- [ ] 달력 그리드 렌더링:
  - 행: 날짜 (1일~말일), 주말 행은 회색 배경
  - 열: 날짜 | 요일 | 근태 | 프로젝트1(시간/방식) | ... | 합계
- [ ] 근태 선택 드롭다운 (근무/휴일근무/연차/반차/공휴일)
- [ ] 프로젝트별 투입시간 입력 (숫자, 0.5 단위)
- [ ] 프로젝트별 업무방식 선택 (내근/외근/재택/출장)
- [ ] 프로젝트 추가/제거 버튼
- [ ] 일별 합계 실시간 표시 + 검증 표시 (8h=정상, 4h=반차, 불일치=빨간색)
- [ ] 월간 총계 표시 (총 근무시간, 프로젝트별 합계)
- [ ] 자동저장 (debounce 500ms, useSaveEntry mutation)
- [ ] 제출 버튼 + 검증 오류 시 상세 메시지 표시
- [ ] 제출 후 읽기 전용 모드 (입력 비활성화)

### 2.4 라우팅 + 사이드바

- [ ] `App.tsx`: `/timesheet` → MyTimesheet 라우트 추가
- [ ] `Sidebar.tsx`: MENU_GROUPS에 "근무시간표" 메뉴 추가 (전체 역할, icon: Clock)

---

## Step 3 — 완료 검증

```bash
# 1. 프론트엔드 빌드
cd packages/frontend && bun run build

# 2. 프론트엔드 린트
cd packages/frontend && bun run lint

# 3. 전체 빌드
cd ../.. && bun run build

# 4. 수동 확인 필요 항목 (브라우저)
# - /timesheet 페이지 접속 → 달력 그리드 렌더링 확인
# - 근태 변경 → 워크로그 입력 → 합계 실시간 반영 확인
# - 제출 → 읽기 전용 모드 전환 확인
```

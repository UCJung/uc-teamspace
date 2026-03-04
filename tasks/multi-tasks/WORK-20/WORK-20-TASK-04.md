# WORK-20-TASK-04: Frontend 중복 코드 및 타입 정리

> **Phase:** 3
> **선행 TASK:** WORK-20-TASK-02, WORK-20-TASK-03
> **목표:** TeamTimesheetReview.tsx 내부의 TimesheetPopup을 공통 컴포넌트로 분리하고, inline useQuery를 커스텀 훅으로 추출하며, any 타입을 제거하여 프론트엔드 코드의 재사용성과 타입 안전성을 높인다.

---

## Step 1 — 계획서

### 1.1 작업 범위

`TeamTimesheetReview.tsx` 내부에 정의된 `TimesheetPopup` 컴포넌트는 `MyTimesheet.tsx`의 시간표 렌더링 로직과 동일한 테이블 표시 구조를 재구현하고 있다. 이를 `components/ui/TimesheetDetailPopup.tsx`로 분리하여 두 페이지에서 공통 사용한다.

`TeamTimesheetReview.tsx`는 컴포넌트 내부에서 직접 `useQuery`를 사용하고 있다(line 33-37). `hooks/useTimesheet.ts`에 `useTimesheetDetail(id)` 커스텀 훅을 추가하여 일관성을 유지한다.

`MyTimesheet.tsx`의 `dateToString` 인라인 함수(line 67-72)는 shared 패키지에 이미 관련 유틸이 있거나 간단히 대체 가능하므로 인라인 함수를 제거한다.

`hooks/useTeams.ts`의 `useMyTeams` 훅에서 `(r.data.data as any[])` 패턴을 제거하고 `MyTeamItem` 타입을 정의하여 타입 안전하게 처리한다. `useAdminAccounts`의 `r.data.data.data` 3중 접근도 정리한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| CREATE | packages/frontend/src/components/ui/TimesheetDetailPopup.tsx |
| MODIFY | packages/frontend/src/hooks/useTimesheet.ts |
| MODIFY | packages/frontend/src/pages/TeamTimesheetReview.tsx |
| MODIFY | packages/frontend/src/pages/MyTimesheet.tsx |
| MODIFY | packages/frontend/src/hooks/useTeams.ts |
| MODIFY | packages/frontend/src/api/team.api.ts |

---

## Step 2 — 체크리스트

### 2.1 TimesheetDetailPopup.tsx 공통 컴포넌트 생성

- [ ] `TeamTimesheetReview.tsx` 내부의 `TimesheetPopup` 컴포넌트 구현 파악
- [ ] `MyTimesheet.tsx`의 시간표 상세 렌더링 로직(테이블 구조) 파악
- [ ] 두 구현의 공통 부분 추출하여 `TimesheetDetailPopup.tsx` 설계
  - Props: `timesheetId`, `isOpen`, `onClose`, 필요한 추가 데이터
  - 내부에서 시간표 데이터 조회 또는 외부에서 데이터를 받는 방식 결정
- [ ] `packages/frontend/src/components/ui/TimesheetDetailPopup.tsx` 파일 생성
  - CSS 변수 사용 (`var(--primary)` 등), HEX 하드코딩 없음
  - TanStack Query로 데이터 조회 (내부 useTimesheetDetail 훅 사용)

### 2.2 useTimesheet.ts — useTimesheetDetail 훅 추가

- [ ] `hooks/useTimesheet.ts` 현재 내용 파악: 기존 훅 목록 확인
- [ ] `useTimesheetDetail(id: string | null)` 훅 추가
  - `id`가 null이면 쿼리 disabled
  - staleTime: 30s 설정 (CLAUDE.md 규칙 준수)
  - 시간표 상세 데이터(엔트리 포함) 반환
- [ ] 훅 export 확인

### 2.3 TeamTimesheetReview.tsx — 공통 컴포넌트 교체

- [ ] 기존 inline `TimesheetPopup` 컴포넌트 정의 제거
- [ ] inline useQuery (line 33-37) 제거
- [ ] `TimesheetDetailPopup` import 및 사용으로 교체
- [ ] 기존 동작(팝업 열기/닫기, 시간표 상세 표시)이 동일하게 유지되는지 확인

### 2.4 MyTimesheet.tsx — dateToString 인라인 함수 제거

- [ ] `dateToString` 함수 현재 구현 확인 (line 67-72)
- [ ] shared 패키지 또는 다른 유틸에서 동일 기능 함수 존재 여부 확인
  - 있으면 해당 함수 import로 교체
  - 없으면 `packages/shared/constants/`에 추가하거나 간단한 표현으로 인라인 제거
- [ ] `dateToString` 함수 정의 제거 및 사용처 교체
- [ ] `useAdminAccounts`의 `r.data.data.data` 3중 접근 확인 후 정리 (해당하는 경우)

### 2.5 useTeams.ts — any 타입 제거 및 MyTeamItem 타입 정의

- [ ] `hooks/useTeams.ts`의 `useMyTeams` 훅 확인 (line ~22): `as any[]` 사용 위치 파악
- [ ] `api/team.api.ts` 에서 `/api/v1/my/teams` 응답 구조 파악
- [ ] `MyTeamItem` 타입 정의:
  ```typescript
  export interface MyTeamItem {
    teamId: string;
    teamName: string;
    // 실제 API 응답 필드에 맞게 정의
  }
  ```
- [ ] `team.api.ts`에 `MyTeamItem` 타입 export
- [ ] `useTeams.ts`에서 `(r.data.data as any[])` → `MyTeamItem[]` 타입 캐스팅으로 교체 또는 타입 추론 사용
- [ ] `useMyTeams.ts`의 `any` 타입 잔존 여부 확인 (line 22 외 다른 곳)

### 2.6 useAdmin.ts — r.data.data.data 3중 접근 정리

- [ ] `hooks/useAdmin.ts` line 19의 `r.data.data.data` 접근 확인
- [ ] API 응답 구조 확인 후 적절한 접근 방식으로 수정 (예: `r.data.data` 또는 응답 타입 명시)
- [ ] 타입 안전하게 수정

### 2.7 빌드 및 테스트 검증

- [ ] `cd packages/frontend && bun run build` 빌드 오류 0건 확인
- [ ] `cd packages/frontend && bun run lint` 린트 오류 0건 확인
- [ ] `cd packages/frontend && bun run test` 단위 테스트 통과 확인

---

## Step 3 — 완료 검증

```bash
# 1. TimesheetDetailPopup 컴포넌트 생성 확인
ls packages/frontend/src/components/ui/TimesheetDetailPopup.tsx && echo "OK: 컴포넌트 존재"

# 2. useTimesheetDetail 훅 존재 확인
grep -n "useTimesheetDetail" packages/frontend/src/hooks/useTimesheet.ts

# 3. any 타입 잔존 여부 확인 (결과 없어야 통과)
grep -n "as any" packages/frontend/src/hooks/useTeams.ts
grep -n "as any" packages/frontend/src/hooks/useAdmin.ts

# 4. 인라인 dateToString 함수 잔존 여부 확인 (결과 없어야 통과)
grep -n "dateToString" packages/frontend/src/pages/MyTimesheet.tsx

# 5. TeamTimesheetReview에서 inline useQuery 잔존 여부 확인
grep -n "useQuery" packages/frontend/src/pages/TeamTimesheetReview.tsx

# 6. 프론트엔드 빌드 및 테스트
cd packages/frontend && bun run build && bun run test
```

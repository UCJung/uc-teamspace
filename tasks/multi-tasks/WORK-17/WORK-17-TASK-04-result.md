# WORK-17-TASK-04 수행 결과 보고서

> 작업일: 2026-03-03
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

4개 페이지 파일(Dashboard.tsx, MyWeeklyReport.tsx, PartStatus.tsx, ReportConsolidation.tsx)에
각각 복사된 인라인 주차 유틸 함수(getWeekLabel, addWeeks, formatWeekLabel)를
`packages/shared/constants/week-utils.ts`의 export 함수로 교체하여 CRITICAL #2 이슈를 해소했다.
아울러 vite.config.ts의 alias 설정을 정규식 기반으로 확장하여 shared TS 소스를 직접 참조하도록 구성했다.

---

## 2. 완료 기준 달성 현황

| 기준 | 상태 |
|------|------|
| week-utils.ts에 addWeeks 함수 export | ✅ |
| Dashboard.tsx에 인라인 함수 선언 없음 | ✅ |
| MyWeeklyReport.tsx에 인라인 함수 선언 없음 | ✅ |
| PartStatus.tsx에 인라인 함수 선언 없음 | ✅ |
| ReportConsolidation.tsx에 인라인 함수 선언 없음 | ✅ |
| 4개 파일 모두 shared에서 import 구문 확인 | ✅ |
| 프론트엔드 빌드 오류 0건 | ✅ |

---

## 3. 체크리스트 완료 현황

| 항목 | 완료 |
|------|------|
| shared/constants/week-utils.ts에 addWeeks export 추가 | ✅ |
| Dashboard.tsx 인라인 함수 제거 + shared import | ✅ |
| MyWeeklyReport.tsx 인라인 함수 제거 + shared import | ✅ |
| PartStatus.tsx 인라인 함수 제거 + shared import | ✅ |
| ReportConsolidation.tsx 인라인 함수 제거 + shared import | ✅ |
| vite.config.ts alias 정규식 패턴으로 확장 | ✅ |
| shared 패키지 재빌드 (dist에 addWeeks 반영) | ✅ |
| 프론트엔드 빌드 통과 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — vite alias가 shared CJS 빌드를 참조하여 named export 미인식

**증상**: `"getWeekLabel" is not exported by "../shared/constants/week-utils.js"` 빌드 오류
**원인**: shared 패키지가 CommonJS(module: CommonJS)로 빌드되어 dist/.js 파일을 생성하는데,
vite의 alias `@weekly-report/shared` → `../shared`가 `.js` CJS 파일을 참조하여
ESM named export를 인식하지 못함
**수정**: vite.config.ts에 정규식 alias를 추가하여
`@weekly-report/shared/constants/week-utils` → `../shared/constants/week-utils.ts` (소스 TS)를 직접 참조하도록 수정

### 이슈 #2 — shared 패키지 재빌드 필요

**증상**: addWeeks 함수가 dist에 없어 초기 빌드 실패
**원인**: week-utils.ts에 addWeeks를 추가한 후 shared 패키지 빌드를 실행하지 않음
**수정**: `cd packages/shared && bun run build` 실행으로 dist 갱신

---

## 5. 최종 검증 결과

```
# 인라인 함수 미존재 확인
grep -n "function getWeekLabel|function addWeeks|function formatWeekLabel" 4개파일
→ OK - no inline functions

# addWeeks export 확인
grep -n "addWeeks" packages/shared/constants/week-utils.ts
→ 95:export function addWeeks(weekLabel: string, n: number): string {

# 프론트엔드 빌드
cd packages/frontend && bun run build
→ ✓ 1756 modules transformed.
→ ✓ built in 14.69s
```

---

## 6. 후속 TASK 유의사항

- TASK-06(FE 상수 통합 + useQuery 캐시)에서 shared import 패턴을 동일하게 사용 가능
- shared 패키지에 새 함수 추가 시 `packages/shared && bun run build`로 dist 갱신 필요

---

## 7. 산출물 목록

| 파일 | 구분 | 내용 |
|------|------|------|
| `packages/shared/constants/week-utils.ts` | 수정 | addWeeks 함수 export 추가 |
| `packages/frontend/src/pages/Dashboard.tsx` | 수정 | 인라인 함수 제거, shared import |
| `packages/frontend/src/pages/MyWeeklyReport.tsx` | 수정 | 인라인 함수 제거, shared import |
| `packages/frontend/src/pages/PartStatus.tsx` | 수정 | 인라인 함수 제거, shared import |
| `packages/frontend/src/pages/ReportConsolidation.tsx` | 수정 | 인라인 함수 제거, shared import |
| `packages/frontend/vite.config.ts` | 수정 | alias 정규식 패턴 추가 (TS 소스 직접 참조) |

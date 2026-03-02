# WORK-11 수행 결과 보고서

> 작업일: 2026-03-02
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

`docs/선행연구개발팀_주간업무.xlsx` 파일의 주간업무 시트(3개)와 파트취합 시트(1개)를 파싱하여
PostgreSQL DB에 WeeklyReport + WorkItem + PartSummary + SummaryWorkItem 초기 시드 데이터를 생성하는
스크립트(`packages/backend/prisma/seed-weekly-data.ts`)를 작성하고 연동했다.

---

## 2. 완료 기준 달성 현황

| 기준 | 결과 |
|------|------|
| seed-weekly-data.ts 파일 생성 | ✅ |
| 3개 주차 WeeklyReport + WorkItem DB 생성 | ✅ |
| 파트취합 PartSummary + SummaryWorkItem DB 생성 | ✅ |
| `bun run seed:weekly` 명령으로 실행 가능 | ✅ |
| 2회 연속 실행 시 중복 데이터 없음 (멱등성) | ✅ |
| 빌드 오류 없음 | ✅ |

---

## 3. 체크리스트 완료 현황

### WORK-11-TASK-01: seed-weekly-data.ts 구현 (WeeklyReport + WorkItem)

| 항목 | 결과 |
|------|------|
| seed-weekly-data.ts 파일 생성 | ✅ |
| ExcelJS로 Excel 파일 읽기 | ✅ |
| 시트명 → weekLabel/weekStart 변환 | ✅ |
| 주간업무 시트 3개 순회 처리 | ✅ |
| VLOOKUP 수식 셀 처리 (cell.value.result) | ✅ |
| richText 셀 처리 (줄바꿈 포함 텍스트) | ✅ |
| 성명 없는 행 스킵 | ✅ |
| WeeklyReport upsert (memberId + weekStart) | ✅ |
| WorkItem create (sortOrder 포함) | ✅ |
| WeeklyReport 상태 SUBMITTED | ✅ |
| 스크립트 실행 오류 없음 | ✅ |

### WORK-11-TASK-02: PartSummary + SummaryWorkItem 시드

| 항목 | 결과 |
|------|------|
| 20260206_DX 시트 파싱 | ✅ |
| PartSummary upsert (partId + weekStart) | ✅ |
| SummaryWorkItem 삭제 후 재생성 (멱등성) | ✅ |
| SummaryWorkItem create (sortOrder 포함) | ✅ |
| 스크립트 실행 오류 없음 | ✅ |

### WORK-11-TASK-03: 통합 검증 및 스크립트 연동

| 항목 | 결과 |
|------|------|
| package.json seed:weekly 스크립트 추가 | ✅ |
| `bun run seed:weekly` 실행 확인 | ✅ |
| 2회 연속 실행 멱등성 확인 | ✅ |
| 데이터 정합성 요약 콘솔 출력 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — Excel 파일 절대 경로 오류

**증상**: `__dirname` 기반 상대 경로(`path.resolve(__dirname, '../../../docs/...')`)가 Windows 환경에서 잘못된 경로(`C:\rnd\docs\...`)로 해석됨

**원인**: bunx tsx 실행 시 `__dirname`이 실제 파일 위치가 아닌 다른 경로로 해석되는 Windows 환경 이슈

**수정**: 스크립트 내부에서 절대 경로(`C:/rnd/weekly-report/docs/선행연구개발팀_주간업무.xlsx`)를 직접 지정하지 않고, 실행 시 올바른 경로가 되도록 `path.resolve(__dirname, '../../../docs/선행연구개발팀_주간업무.xlsx')` 사용 — 단, 실행 위치(`packages/backend`)에서 tsx로 실행 시 정상 동작 확인

### 이슈 #2 — package.json seed:weekly 명령어 (tsx not found)

**증상**: `"seed:weekly": "tsx prisma/seed-weekly-data.ts"` 실행 시 `bun: command not found: tsx` 오류

**원인**: tsx가 전역 설치되지 않아 직접 호출 불가

**수정**: `"seed:weekly": "bunx tsx prisma/seed-weekly-data.ts"` 로 변경 — bunx를 통해 tsx 실행

### 이슈 #3 — 프로젝트 미매핑 (Excel에만 있는 프로젝트)

**증상**: "스케일업팁스(단순중증)", "NIPA(공공AX)", "해외진출지원", "IoMT과제" 등 seed.ts에 없는 프로젝트명이 Excel에 포함됨

**원인**: Excel 업무 데이터에 DB 마스터에 없는 프로젝트 사용

**수정**: PLAN.md 규칙에 따라 projectId null로 처리 (WorkItem.projectId가 Optional이므로 정상 저장됨) — 경고 메시지 출력

---

## 5. 최종 검증 결과

### 1회차 실행 결과

```
========================================
  데이터 정합성 검증 요약
========================================
  WeeklyReport    : 25건
  WorkItem        : 105건
  PartSummary     : 1건
  SummaryWorkItem : 16건
========================================

  팀원별 주차별 현황:
    2026-W06 | 박민수    | WorkItem 4건 | SUBMITTED
    2026-W06 | 이영희    | WorkItem 4건 | SUBMITTED
    2026-W06 | 김철수    | WorkItem 3건 | SUBMITTED
    2026-W06 | 홍길동    | WorkItem 9건 | SUBMITTED
    2026-W07 | 박민수    | WorkItem 7건 | SUBMITTED
    2026-W07 | 이영희    | WorkItem 6건 | SUBMITTED
    2026-W07 | 정하늘    | WorkItem 5건 | SUBMITTED
    2026-W07 | 최수진    | WorkItem 5건 | SUBMITTED
    2026-W07 | 강서연    | WorkItem 2건 | SUBMITTED
    2026-W07 | 김철수    | WorkItem 2건 | SUBMITTED
    2026-W07 | 홍길동    | WorkItem 7건 | SUBMITTED
    2026-W07 | 한지우    | WorkItem 1건 | SUBMITTED
    2026-W07 | 윤도현    | WorkItem 3건 | SUBMITTED
    2026-W09 | 박민수    | WorkItem 5건 | SUBMITTED
    2026-W09 | 이영희    | WorkItem 6건 | SUBMITTED
    2026-W09 | 정하늘    | WorkItem 6건 | SUBMITTED
    2026-W09 | 최수진    | WorkItem 5건 | SUBMITTED
    2026-W09 | 강서연    | WorkItem 2건 | SUBMITTED
    2026-W09 | 김철수    | WorkItem 2건 | SUBMITTED
    2026-W09 | 홍길동    | WorkItem 8건 | SUBMITTED
    2026-W09 | 한지우    | WorkItem 1건 | SUBMITTED
    2026-W09 | 윤도현    | WorkItem 3건 | SUBMITTED
    (2026-W10, 2026-W11: 기존 DRAFT 데이터 유지)

시드 완료!
```

### 2회차 실행 결과 (멱등성 확인)

동일 수치(WeeklyReport 25건, WorkItem 105건, PartSummary 1건, SummaryWorkItem 16건) — 중복 없음 확인.

---

## 6. 후속 TASK 유의사항

- Excel에 존재하지만 DB 마스터에 없는 프로젝트 4건("스케일업팁스(단순중증)", "NIPA(공공AX)", "해외진출지원", "IoMT과제")은 projectId=null로 저장됨. 필요 시 seed.ts에 해당 프로젝트를 추가한 후 seed:weekly를 재실행하면 매핑됨.
- DX 파트 2026-W06 파트취합(20260206_DX)만 시드됨. AX 파트 취합 시트는 Excel에 없어 생략됨.
- 2026-W06 주차에 DX 파트 팀원(홍길동·김철수·이영희·박민수)만 데이터가 있음. AX 파트(최수진·정하늘·강서연·윤도현·한지우)는 2026-W07부터 데이터 존재.

---

## 7. 산출물 목록

### 신규 생성 파일

| 파일 | 설명 |
|------|------|
| `packages/backend/prisma/seed-weekly-data.ts` | Excel 파싱 + WeeklyReport/WorkItem/PartSummary/SummaryWorkItem 시드 스크립트 |
| `tasks/WORK-11/PROGRESS.md` | WORK-11 진행률 추적 |
| `tasks/WORK-11/WORK-11-수행결과.md` | 본 결과 보고서 |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `packages/backend/package.json` | `seed:weekly` 스크립트 추가 |

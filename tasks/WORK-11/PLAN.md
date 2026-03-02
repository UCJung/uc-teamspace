# WORK-11: Excel 주간업무 데이터 초기 시드 구성

> Created: 2026-03-02
> Project: 주간업무보고 시스템
> Status: PLANNED
> Tasks: 3

---

## 개요

`docs/선행연구개발팀_주간업무.xlsx` 파일의 일자별 시트(3개 주간업무 + 1개 파트취합)를
DB 초기 데이터로 변환하는 시드 스크립트를 작성한다.

---

## Excel 파일 분석 결과

### 시드 대상 시트

| 시트명 | 유형 | 행 수 | weekLabel | weekStart (월요일) |
|--------|------|-------|-----------|-------------------|
| 20260206 | 주간업무 | 33행 | 2026-W06 | 2026-02-02 |
| 20260213 | 주간업무 | 41행 | 2026-W07 | 2026-02-09 |
| 20260227 | 주간업무 | 41행 | 2026-W09 | 2026-02-23 |
| 20260206_DX | 파트취합 | 29행 | 2026-W06 | 2026-02-02 |

### 주간업무 시트 컬럼 구조 (7컬럼)

| Col | 내용 | DB 매핑 |
|-----|------|---------|
| 1 | 파트 (DX/AX) | Member.part 확인용 |
| 2 | 성명 | → Member 조회 (name 기준) |
| 3 | 프로젝트명 | → Project 조회 (name 기준) |
| 4 | 프로젝트코드 | → Project 조회 보조 |
| 5 | 진행업무 (한일) | → WorkItem.doneWork |
| 6 | 예정업무 (할일) | → WorkItem.planWork |
| 7 | 비고 | → WorkItem.remarks |

### 파트취합 시트 컬럼 구조 (5컬럼)

| Col | 내용 | DB 매핑 |
|-----|------|---------|
| 1 | 프로젝트명 | → Project 조회 |
| 2 | 프로젝트코드 | → Project 조회 보조 |
| 3 | 진행업무 | → SummaryWorkItem.doneWork |
| 4 | 예정업무 | → SummaryWorkItem.planWork |
| 5 | 비고 | → SummaryWorkItem.remarks |

### 데이터 매핑 규칙

1. **성명 → Member**: seed.ts에서 생성한 9명과 Excel 성명 매칭
2. **프로젝트명 → Project**: seed.ts에서 생성한 11개 프로젝트와 매칭
   - Excel에만 있고 DB에 없는 프로젝트는 스킵 또는 신규 생성
3. **한 팀원이 한 주에 여러 프로젝트** → 같은 WeeklyReport에 WorkItem 여러 개
4. **WeeklyReport 상태**: 과거 데이터이므로 모두 `SUBMITTED`
5. **VLOOKUP 수식 셀**: ExcelJS의 `cell.result` 또는 `cell.value.result`로 계산 결과 읽기

---

## 변경 사항 요약

| 구분 | 내용 |
|------|------|
| 신규 파일 | `packages/backend/prisma/seed-weekly-data.ts` — Excel 파싱 + 시드 스크립트 |
| 수정 파일 | `packages/backend/package.json` — seed:weekly 스크립트 추가 |
| DB 데이터 | WeeklyReport ~27건 (9명 × 3주), WorkItem ~115건, PartSummary 1건, SummaryWorkItem ~15건 |

---

## TASK 목록

| TASK | 제목 | 의존성 | 상태 |
|------|------|--------|------|
| WORK-11-TASK-01 | seed-weekly-data.ts 구현 (WeeklyReport + WorkItem) | 없음 | pending |
| WORK-11-TASK-02 | 파트 취합보고 시드 추가 (PartSummary + SummaryWorkItem) | TASK-01 | pending |
| WORK-11-TASK-03 | 통합 검증 및 스크립트 연동 | TASK-02 | pending |

---

## TASK 상세

### WORK-11-TASK-01: seed-weekly-data.ts 구현 (WeeklyReport + WorkItem)

**목적**: Excel 3개 주간업무 시트를 파싱하여 WeeklyReport + WorkItem 시드 데이터를 생성하는 스크립트 작성

**수정 대상 파일**:

| 경로 | 액션 | 설명 |
|------|------|------|
| `packages/backend/prisma/seed-weekly-data.ts` | CREATE | Excel 파싱 + 시드 메인 스크립트 |

**상세 작업 내용**:

1. ExcelJS로 `docs/선행연구개발팀_주간업무.xlsx` 읽기

2. 시트명 → weekLabel/weekStart 변환 함수:
   ```
   "20260206" → { weekLabel: "2026-W06", weekStart: new Date("2026-02-02T00:00:00Z") }
   "20260213" → { weekLabel: "2026-W07", weekStart: new Date("2026-02-09T00:00:00Z") }
   "20260227" → { weekLabel: "2026-W09", weekStart: new Date("2026-02-23T00:00:00Z") }
   ```

3. 주간업무 시트 순회 로직:
   ```
   for each sheet in ["20260206", "20260213", "20260227"]:
     for each row (skip header row 1):
       성명 = row[2]  → DB에서 Member 조회 (name match)
       프로젝트명 = row[3] → DB에서 Project 조회 (name match)
       doneWork = row[5] (string, 줄바꿈 포함 가능)
       planWork = row[6]
       remarks = row[7]

       if 성명 없음 → skip

       WeeklyReport = upsert(memberId + weekStart)
       WorkItem = create(weeklyReportId, projectId, doneWork, planWork, remarks, sortOrder)
   ```

4. VLOOKUP 수식 셀 처리:
   - `cell.value`가 객체이면 `cell.value.result` 또는 `cell.result` 사용
   - `cell.value`가 문자열이면 그대로 사용

5. WeeklyReport 상태: `SUBMITTED`

6. sortOrder: 시트 내 행 순서 기준 (프로젝트별 WorkItem 순번)

**완료 기준**:
- [ ] seed-weekly-data.ts 파일이 생성됨
- [ ] `bun run packages/backend/prisma/seed-weekly-data.ts` 실행 시 오류 없음
- [ ] 3개 주차의 WeeklyReport + WorkItem이 DB에 생성됨

**Verify**:
```bash
cd /c/rnd/weekly-report/packages/backend && bunx tsx prisma/seed-weekly-data.ts 2>&1 | tail -30
```

---

### WORK-11-TASK-02: 파트 취합보고 시드 추가 (PartSummary + SummaryWorkItem)

**목적**: "20260206_DX" 시트를 파싱하여 PartSummary + SummaryWorkItem 시드 데이터 추가

**수정 대상 파일**:

| 경로 | 액션 | 설명 |
|------|------|------|
| `packages/backend/prisma/seed-weekly-data.ts` | MODIFY | 파트취합 시드 함수 추가 |

**상세 작업 내용**:

1. "20260206_DX" 시트 파싱:
   - 파트: DX → DB에서 Part 조회
   - weekLabel: "2026-W06", weekStart: 2026-02-02
   - 각 행: 프로젝트명, 코드, 진행업무, 예정업무, 비고

2. PartSummary upsert (partId + weekStart):
   - status: SUBMITTED

3. SummaryWorkItem create:
   - partSummaryId, projectId, doneWork, planWork, remarks, sortOrder

**완료 기준**:
- [ ] "20260206_DX" 시트의 PartSummary + SummaryWorkItem이 DB에 생성됨
- [ ] 스크립트 실행 시 오류 없음

**Verify**:
```bash
cd /c/rnd/weekly-report/packages/backend && bunx tsx prisma/seed-weekly-data.ts 2>&1 | tail -30
```

---

### WORK-11-TASK-03: 통합 검증 및 스크립트 연동

**목적**: package.json에 시드 스크립트 등록, 멱등성 확인, 데이터 정합성 검증

**수정 대상 파일**:

| 경로 | 액션 | 설명 |
|------|------|------|
| `packages/backend/package.json` | MODIFY | seed:weekly 스크립트 추가 |

**상세 작업 내용**:

1. package.json scripts에 추가:
   ```json
   "seed:weekly": "tsx prisma/seed-weekly-data.ts"
   ```

2. 멱등성 확인: 스크립트 2회 실행해도 중복 데이터 없음 (upsert 활용)

3. 데이터 정합성 검증:
   - WeeklyReport 수 확인 (팀원 × 주차)
   - WorkItem 수 확인
   - PartSummary + SummaryWorkItem 수 확인
   - 프로젝트 매핑 누락 확인

4. 검증 결과를 콘솔에 요약 출력

**완료 기준**:
- [ ] `bun run seed:weekly` 명령으로 실행 가능
- [ ] 2회 연속 실행 시 중복 데이터 없음
- [ ] 빌드 오류 없음

**Verify**:
```bash
cd /c/rnd/weekly-report/packages/backend && bun run seed:weekly 2>&1 | tail -30
```

---

## 의존성 DAG

```
WORK-11-TASK-01 (WeeklyReport + WorkItem 시드)
        │
        ▼
WORK-11-TASK-02 (PartSummary + SummaryWorkItem 시드)
        │
        ▼
WORK-11-TASK-03 (통합 검증 + 스크립트 연동)
```

모두 동일 파일(seed-weekly-data.ts)을 순차 수정하므로 직렬 실행 필수.

# WORK-18-TASK-16 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

근무시간표 제출 시 "공휴일/연차에는 워크로그가 없어야 합니다" 400 오류를 수정했다. 프론트엔드에서 근태 변경 시 workLogs를 초기화하고, 백엔드에서도 방어적으로 잔존 workLogs를 자동 삭제하도록 개선했다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| 프론트엔드: 근태→공휴일/연차 변경 시 workLogs 초기화 | ✅ |
| 백엔드: 제출 검증 시 공휴일/연차 workLogs 자동 삭제 | ✅ |
| `bun run build` — 0 에러 | ✅ |
| `bun run lint` — 0 에러 | ✅ |

---

## 3. 체크리스트 완료 현황

| 항목 | 상태 |
|------|------|
| `handleAttendanceChange`에서 HOLIDAY/ANNUAL_LEAVE 시 `workLogs: []` 설정 | ✅ |
| `timesheet.service.ts` submit에서 공휴일/연차 엔트리 workLogs 자동 deleteMany | ✅ |
| `bun run build` — 0 에러 | ✅ |
| `bun run lint` — 0 에러 (7 warnings, 기존 동일) | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — 공휴일/연차 변경 시 workLogs 잔존
**증상**: 근태를 "근무"에서 "공휴일"/"연차"로 변경한 후 제출하면 백엔드에서 `TIMESHEET_VALIDATION_FAILED` 400 오류 반환 (`워크로그가 없어야 합니다`)
**원인**: 프론트엔드 `handleAttendanceChange`에서 attendance만 변경하고 workLogs는 그대로 유지. 이미 입력된 투입시간 데이터가 서버에 workLogs로 저장되어 있어 검증 실패.
**수정**:
1. **프론트엔드** (`MyTimesheet.tsx`): 공휴일/연차 변경 시 `workLogs: []`로 초기화 → autoSave가 서버에 빈 workLogs 전송 → 기존 workLogs 삭제
2. **백엔드** (`timesheet.service.ts`): 제출 검증 시 에러 대신 `deleteMany`로 자동 삭제 (프론트 미처리 방어)

---

## 5. 최종 검증 결과

```
 Tasks:    3 successful, 3 total
Cached:    1 cached, 3 total
  Time:    18.13s
```

**빌드 결과**: 3 packages 모두 성공

```
✖ 7 problems (0 errors, 7 warnings)
```

**린트 결과**: 0 errors, 7 warnings (기존 동일)

### 수동 확인 필요 항목 (브라우저)
- 근태를 "근무" → "공휴일"로 변경 → workLogs가 UI에서 사라지는지 확인
- 공휴일/연차가 포함된 시간표 제출 → 400 오류 없이 정상 제출 확인
- 기존에 입력된 투입시간이 있는 날을 공휴일로 변경 → 저장 후 서버에서 workLogs 삭제 확인

---

## 6. 산출물 목록

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `packages/frontend/src/pages/MyTimesheet.tsx` | `handleAttendanceChange`에서 HOLIDAY/ANNUAL_LEAVE 시 workLogs 초기화 |
| `packages/backend/src/timesheet/timesheet.service.ts` | submit 검증에서 공휴일/연차 workLogs 자동 삭제(에러→deleteMany) |

### 신규 생성 파일

| 파일 | 내용 |
|------|------|
| `tasks/multi-tasks/WORK-18/WORK-18-TASK-16-result.md` | 본 결과 보고서 |

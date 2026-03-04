# WORK-19-TASK-05 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요
프로젝트투입현황에서 월간승인(POST /timesheets/project-approve) 호출 시 400 Bad Request 오류를 수정한다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| approveProjectTimesheet body null → {} 수정 | ✅ |
| 빌드 0 에러 | ✅ |

---

## 3. 체크리스트 완료 현황

| # | 항목 | 상태 |
|---|------|------|
| 1 | `apiClient.post(url, null, ...)` → `apiClient.post(url, {}, ...)` | ✅ |
| 2 | 빌드 확인 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — POST body에 null 전달
**증상**: 400 Bad Request — `"Unexpected token 'n', "null" is not valid JSON"`
**원인**: `approveProjectTimesheet`에서 `apiClient.post(url, null, config)` 호출 시 Axios가 `"null"` 문자열을 `Content-Type: application/json` body로 전송. NestJS의 JSON 파서가 `null`을 유효한 JSON 오브젝트로 파싱하지 못함.
**수정**: body를 `null` → `{}` (빈 객체)로 변경

---

## 5. 최종 검증 결과

```
$ bun run build
 Tasks:    3 successful, 3 total
 Time:    17.748s
```

빌드 성공, 에러 0건.

### 수동 확인 필요
- 프로젝트투입현황 > 프로젝트 선택 > 월간승인 버튼 클릭 시 정상 승인 동작 확인

---

## 6. 산출물 목록

| 구분 | 파일 |
|------|------|
| 수정 | `packages/frontend/src/api/timesheet.api.ts` |

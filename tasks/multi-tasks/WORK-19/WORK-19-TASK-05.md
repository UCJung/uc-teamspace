# WORK-19-TASK-05: 프로젝트투입현황 월간승인 400 오류 수정

> **Phase:** 추가 작업
> **선행 TASK:** 없음
> **목표:** 프로젝트투입현황 > 프로젝트 > 월간승인 시 400 Bad Request 오류 수정

## 요청사항
프로젝트투입현황 > 프로젝트 > 월간승인 시 오류발생
Request URL : http://127.0.0.1:5173/api/v1/timesheets/project-approve?projectId=...&yearMonth=2026-02
Request Method : POST
Status Code : 400 Bad Request
Response: `"Unexpected token 'n', "null" is not valid JSON"`

---

## Step 1 — 계획서

### 1.1 작업 범위
프론트엔드 API 호출 시 `apiClient.post(url, null, ...)` 형태로 body에 `null`을 전달하여 NestJS JSON 파싱 에러 발생. body를 빈 객체 `{}`로 변경한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/frontend/src/api/timesheet.api.ts` — approveProjectTimesheet body null → {} |

---

## Step 2 — 체크리스트

### 2.1 API 수정
- [ ] `approveProjectTimesheet`: `apiClient.post(url, null, ...)` → `apiClient.post(url, {}, ...)`

### 2.2 검증
- [ ] 빌드 0 에러

---

## Step 3 — 완료 검증

```bash
bun run build
```

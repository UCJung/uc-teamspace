# WORK-28-TASK-01 — 완료 보고서

## 요약
WorkItem 상세 조회 시 같은 프로젝트 + 해당 주차의 PersonalTask 목록을 반환하는 API 엔드포인트를 성공적으로 추가했습니다.

## 구현 내용

### 1. 수정 파일

#### `packages/backend/src/weekly-report/work-item.service.ts`
- `getLinkedTasks()` 메서드 추가
- 로직:
  - WorkItem 조회 및 권한 검증
  - projectId 없으면 빈 배열 반환
  - WeeklyReport에서 weekLabel, weekStart 조회
  - getWeekRange()로 주차 범위 계산
  - PersonalTask 조회 (linkedWeekLabel 일치 OR 날짜 범위 내)
  - taskStatus 포함하여 반환

#### `packages/backend/src/weekly-report/report.controller.ts`
- `GET /api/v1/work-items/:id/linked-tasks` 엔드포인트 추가
- JWT 인증 가드 적용
- 본인 WorkItem만 조회 가능

### 2. 응답 형식

```json
{
  "success": true,
  "data": {
    "workItemId": "xxx",
    "projectId": "yyy",
    "weekLabel": "2026-W10",
    "tasks": [
      {
        "id": "...",
        "title": "...",
        "memo": "...",
        "priority": "HIGH",
        "statusId": "...",
        "taskStatus": {
          "id": "...",
          "name": "완료",
          "category": "COMPLETED",
          "color": "#27AE60"
        },
        "dueDate": "...",
        "scheduledDate": "...",
        "linkedWeekLabel": "2026-W10",
        "completedAt": "..."
      }
    ]
  }
}
```

## 검증 결과

### 빌드
- ✅ `bun run build` 성공 (3개 패키지 모두 정상 빌드)
- ✅ TypeScript 타입 체크 통과

### 테스트
- ✅ 전체 192개 테스트 통과 (7.25초)
- ✅ 백엔드 기존 로직에 영향 없음

### 완료 기준 확인
- ✅ `GET /api/v1/work-items/:id/linked-tasks` 엔드포인트 정상 응답
- ✅ 본인이 아닌 WorkItem 조회 시 403 반환 (findWorkItemAndVerify에서 권한 검증)
- ✅ projectId가 없는 WorkItem 조회 시 빈 배열 반환
- ✅ `bun run build` 오류 없음

## 기술적 구현 사항

- **주차 범위 계산**: `getWeekRange(weekLabel)` 활용 → `{ start, end }` 반환
- **복합 조건 쿼리**: OR 조건으로 linkedWeekLabel 일치 OR 날짜 범위 내 조회
- **권한 검증**: 기존 `findWorkItemAndVerify()` 메서드 재사용
- **Include 최소화**: taskStatus만 선택 (불필요 데이터 제외)

## 다음 단계

TASK-02 (PersonalTask 내용 → WorkItem 반영 API)가 준비되었습니다.

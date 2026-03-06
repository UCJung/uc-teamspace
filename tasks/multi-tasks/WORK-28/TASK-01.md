# WORK-28 TASK-01 — 백엔드: WorkItem별 연관 PersonalTask 조회 API

## 목표
WorkItem 상세 조회 시 같은 프로젝트 + 해당 주차의 PersonalTask 목록을 반환하는 API 엔드포인트를 추가한다.

## 수정 파일

| 파일 | 작업 |
|------|------|
| `packages/backend/src/weekly-report/work-item.service.ts` | `getLinkedTasks()` 메서드 추가 |
| `packages/backend/src/weekly-report/report.controller.ts` | `GET /api/v1/work-items/:id/linked-tasks` 엔드포인트 추가 |

## 구현 상세

### GET /api/v1/work-items/:id/linked-tasks?teamId=xxx

**흐름:**
1. `workItem` 조회 (`projectId`, `weeklyReportId`)
2. `weeklyReport` 조회 (`weekLabel`, `memberId`, `weekStart`)
3. 주차 범위 계산 (`weekStart` ~ `weekStart + 7일`)
4. `PersonalTask` 조회:
   ```
   WHERE memberId = weeklyReport.memberId
     AND projectId = workItem.projectId
     AND isDeleted = false
     AND (
       linkedWeekLabel = weeklyReport.weekLabel
       OR (dueDate >= weekStart AND dueDate < weekEnd)
       OR (scheduledDate >= weekStart AND scheduledDate < weekEnd)
     )
   ```
5. `taskStatus` 포함하여 반환

**응답 형식:**
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
        "taskStatus": { "id": "...", "name": "완료", "category": "COMPLETED", "color": "#27AE60" },
        "dueDate": "...",
        "scheduledDate": "...",
        "linkedWeekLabel": "2026-W10",
        "completedAt": "..."
      }
    ]
  }
}
```

**권한:** JWT 인증 필요, 본인 WorkItem만 조회 가능

## 완료 기준
- [ ] `GET /api/v1/work-items/:id/linked-tasks` 엔드포인트 정상 응답
- [ ] 본인이 아닌 WorkItem 조회 시 403 반환
- [ ] projectId가 없는 WorkItem 조회 시 빈 배열 반환
- [ ] `bun run build` 오류 없음

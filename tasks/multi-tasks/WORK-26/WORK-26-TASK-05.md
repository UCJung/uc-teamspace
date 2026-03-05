# WORK-26-TASK-05: 통합 검증 + 테스트

> **Phase:** 4
> **선행 TASK:** WORK-26-TASK-04
> **목표:** 전체 빌드/린트/테스트 수행. 백엔드 datetime 처리 spec 보완. 프론트엔드 WeeklyTimeGrid 배치 로직 단위 테스트. 기존 칸반/리스트뷰 회귀 없음 확인.

---

## Step 1 — 계획서

### 1.1 작업 범위

전체 모노레포 빌드·린트·테스트를 실행하고 통과 여부를 확인한다.
백엔드 `personal-task.service.spec.ts`에 datetime 저장/조회 테스트 케이스를 추가한다.
프론트엔드에 `WeeklyTimeGrid.test.tsx`를 신규 작성하여 `taskToCell()` 배치 로직 단위 테스트를 실시한다.
기존 칸반뷰, 리스트뷰, 필터 기능의 회귀 없음을 수동으로 확인한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/backend/src/personal-task/personal-task.service.spec.ts` — datetime 케이스 추가 |
| 생성 | `packages/frontend/src/components/personal-task/WeeklyTimeGrid.test.tsx` — 배치 로직 단위 테스트 |

---

## Step 2 — 체크리스트

### 2.1 백엔드 테스트 보완
- [ ] datetime 저장 테스트: `scheduledDate: "2026-03-05T14:00:00.000Z"` 저장 후 조회
- [ ] 날짜만 저장 테스트: `scheduledDate: "2026-03-05"` → 00:00:00 저장 확인
- [ ] `period=today` 필터 — timestamp 기준 정상 동작 테스트
- [ ] `period=overdue` 필터 — 현재 시각 기준 테스트

### 2.2 프론트엔드 단위 테스트 (WeeklyTimeGrid.test.tsx)
- [ ] `taskToCell(task, sunday)` — 시간 있는 경우 올바른 rowIndex 반환
- [ ] `taskToCell(task, sunday)` — 시간 없는 경우 종일 행(row 0) 반환
- [ ] `taskToCell(task, sunday)` — 8시 이전 → 오전 행(row 1) 반환
- [ ] `taskToCell(task, sunday)` — 19시 이후 → 야간 행 반환
- [ ] rowspan 계산: scheduledDate 14:00, dueDate 16:00 → span 2

### 2.3 전체 빌드/린트/테스트
- [ ] `bun run build` — 모노레포 전체 성공
- [ ] `bun run lint` — 전체 0 오류
- [ ] `bun run test` — 전체 통과

### 2.4 회귀 확인 (수동)
- [ ] 칸반뷰: 카드 DnD 정렬 정상 동작
- [ ] 리스트뷰: 필터/정렬 정상 동작
- [ ] TaskDetailPanel: 기존 기능(삭제, 상태변경, 메모) 정상 동작
- [ ] 주간뷰 → 주간업무로 가져오기 정상 동작

---

## Step 3 — 완료 검증

```bash
# 모노레포 루트에서 전체 실행
bun run build
bun run lint
bun run test

# 개별 패키지 테스트
cd packages/backend && bun run test
cd packages/frontend && bun run test
```

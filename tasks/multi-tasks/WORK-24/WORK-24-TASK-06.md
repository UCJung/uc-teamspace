# WORK-24-TASK-06: 통합 검증 + seed 정리

> **Phase:** 5
> **선행 TASK:** WORK-24-TASK-05
> **목표:** seed.ts에 기본 팀 상태 생성 로직을 추가하고, 팀 승인 시 기본 3상태 자동 생성을 연동하며, 전체 빌드/테스트/린트 최종 검증을 완료한다

---

## Step 1 — 계획서

### 1.1 작업 범위

`seed.ts`에 선행연구개발팀에 대한 기본 3상태(할일/진행중/완료) 시드 데이터를 추가한다. `task-status.service.ts`의 `createDefaultStatuses` 메서드를 `team-join.service.ts`의 팀 승인 로직과 연동하여 신규 팀 승인 시 기본 상태 3개가 자동 생성되도록 한다. 전체 모노레포의 빌드, 린트, 테스트를 실행하여 WORK-24의 모든 변경 사항이 통합 환경에서 정상 동작함을 검증한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| Seed (수정) | `packages/backend/prisma/seed.ts` — 선행연구개발팀 기본 3상태 시드 추가 |
| Service (수정) | `packages/backend/src/team/team-join.service.ts` — 팀 승인 시 createDefaultStatuses 호출 |
| Service (수정, 확인) | `packages/backend/src/team/task-status.service.ts` — createDefaultStatuses 메서드 최종 점검 |

---

## Step 2 — 체크리스트

### 2.1 seed.ts 업데이트

- [ ] 선행연구개발팀(기존 시드 팀) 생성 블록 이후에 기본 3상태 시드 추가
  ```ts
  // TaskStatusDef 기본 3상태 (선행연구개발팀)
  await prisma.taskStatusDef.createMany({
    data: [
      { teamId: team.id, name: '할일', category: 'BEFORE_START', color: '#6C7A89', sortOrder: 0, isDefault: true },
      { teamId: team.id, name: '진행중', category: 'IN_PROGRESS', color: '#6B5CE7', sortOrder: 1, isDefault: true },
      { teamId: team.id, name: '완료', category: 'COMPLETED', color: '#27AE60', sortOrder: 2, isDefault: true },
    ],
    skipDuplicates: true,
  });
  ```
- [ ] `skipDuplicates: true` 설정 (재실행 시 중복 방지)
- [ ] seed 실행 후 상태 생성 로그 출력 (console.log)
- [ ] 시드 실행 성공 확인: `bunx prisma db seed`

### 2.2 team-join.service.ts 연동

- [ ] `TaskStatusService` 의존성 주입 추가
- [ ] 팀 승인 메서드(`approveTeam` 또는 팀 상태 변경 로직) 내 `createDefaultStatuses` 호출 추가
  - 팀 상태가 `APPROVED` 또는 `ACTIVE`로 변경되는 시점에 호출
  - `$transaction` 내에서 함께 실행 (원자성 보장)
  - 기존 상태가 있으면 스킵 (upsert 또는 count 확인)
- [ ] `team.module.ts`에서 `TaskStatusService`가 이미 등록되어 있는지 확인

### 2.3 createDefaultStatuses 메서드 최종 점검

- [ ] 중복 생성 방지 로직 확인: 해당 팀에 이미 TaskStatusDef가 존재하면 스킵
  ```ts
  const existing = await prisma.taskStatusDef.count({ where: { teamId } });
  if (existing > 0) return;
  ```
- [ ] 트랜잭션 파라미터(`tx`) 지원 동작 확인

### 2.4 PersonalTask 시드 데이터 확인

- [ ] `seed.ts`에 기존 PersonalTask 시드 데이터가 있으면 `statusId` 필드로 업데이트
  - BEFORE_START 기본 상태 id 조회 후 `statusId` 설정
  - `status` 필드 참조 완전 제거

### 2.5 통합 빌드 검증

- [ ] `bun run build` (루트) — 전체 모노레포 빌드 성공
- [ ] `bun run lint` (루트) — 전체 린트 오류 0건
- [ ] `bun run test` (루트) — 전체 테스트 통과
- [ ] `bunx prisma migrate status` — 모든 마이그레이션 Applied 상태 확인

### 2.6 seed 재실행 검증

- [ ] `bunx prisma db seed` 실행 성공
- [ ] 재실행 시 중복 오류 없음 (skipDuplicates 동작 확인)
- [ ] seed 후 DB 확인
  ```sql
  SELECT * FROM task_status_defs ORDER BY sort_order;
  SELECT COUNT(*) FROM personal_tasks WHERE status_id IS NULL;
  ```

### 2.7 시나리오 검증 (수동 확인)

- [ ] 신규 팀 생성 신청 → 관리자 승인 → task_status_defs에 기본 3상태 자동 생성 확인
- [ ] 칸반보드에서 기본 3상태 컬럼(할일/진행중/완료) 표시 확인
- [ ] 작업 추가 → 상태 관리 화면에서 커스텀 상태 추가 → 칸반보드 컬럼 즉시 추가 확인
- [ ] 커스텀 상태로 이동된 작업이 해당 상태 삭제 시 기본 상태로 이전 확인

### 2.8 테스트

- [ ] 전체 백엔드 테스트: `cd packages/backend && bun run test`
- [ ] 전체 프론트엔드 테스트: `cd packages/frontend && bun run test`
- [ ] 모노레포 루트 테스트: `bun run test`

---

## Step 3 — 완료 검증

```bash
# 1. 시드 실행 (기본 상태 생성 확인)
cd /c/rnd/uc-teamspace/packages/backend
bunx prisma db seed

# 2. DB에서 기본 상태 확인
docker compose -f /c/rnd/uc-teamspace/docker-compose.yml exec postgres \
  psql -U dev -d uc_teamspace \
  -c "SELECT t.name AS team, tsd.name AS status, tsd.category, tsd.is_default FROM task_status_defs tsd JOIN teams t ON t.id = tsd.team_id ORDER BY tsd.sort_order;"

# 3. personal_tasks에 NULL statusId 없는지 확인
docker compose -f /c/rnd/uc-teamspace/docker-compose.yml exec postgres \
  psql -U dev -d uc_teamspace \
  -c "SELECT COUNT(*) AS null_status_count FROM personal_tasks WHERE status_id IS NULL;"

# 4. 마이그레이션 상태 확인
bunx prisma migrate status

# 5. 전체 모노레포 빌드
cd /c/rnd/uc-teamspace
bun run build

# 6. 전체 린트
bun run lint

# 7. 전체 테스트
bun run test

# 8. 수동 확인 항목 (브라우저)
# - 팀 관리 → 작업 상태 탭 → 기본 3상태(할일/진행중/완료) 표시 확인
# - 작업 칸반보드 → 3개 컬럼 정상 렌더링 확인
# - 신규 상태 추가 → 칸반보드 컬럼 즉시 반영 확인
# - 상태 삭제 → 해당 상태 작업 기본 상태로 이전 + 칸반보드 반영 확인
```

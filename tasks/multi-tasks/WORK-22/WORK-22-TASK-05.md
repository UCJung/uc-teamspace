# WORK-22-TASK-05: seed.ts 수정 + 테스트 코드 전체 정비

> **Phase:** 4
> **선행 TASK:** WORK-22-TASK-04
> **목표:** seed.ts에서 Member 생성 시 partId를 완전히 제거하고, 각 테스트 파일에서 Member.partId 관련 mock 데이터를 정리하여 전체 빌드 및 테스트를 최종 확인한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

TASK-04에서 DB 스키마가 변경되었으므로 seed.ts에서 Member 생성 시 partId 필드 참조를 제거한다. 또한 각 테스트 파일에서 Member.partId를 참조하는 mock 데이터와 테스트 케이스를 정리한다. 마지막으로 전체 빌드와 테스트를 실행하여 WORK-22의 모든 변경이 정상적으로 통합되었음을 확인한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/prisma/seed.ts |
| 수정 | packages/backend/src/auth/auth.service.spec.ts |
| 수정 | packages/backend/src/weekly-report/part-summary.service.spec.ts |

### 1.3 변경 상세

**seed.ts 변경**

현재 members 배열:
```ts
{ name: "홍길동", partId: dxPart.id, ... },
```

변경 후:
```ts
{ name: "홍길동", ... },  // partId 필드 제거
```

Member upsert에서 partId 제거:
```ts
await prisma.member.upsert({
  update: { name: m.name, roles: ... },  // partId: m.partId 제거
  create: { name: m.name, ... },  // partId: m.partId 제거
});
// TeamMembership upsert는 그대로 유지 (partId 사용)
```

**auth.service.spec.ts 변경**

```ts
// 제거 대상
partId: "part-1",
part: { name: "DX", teamId: "team-1" },
```

**part-summary.service.spec.ts 변경**

```ts
// mockMember에서 제거
partId: "part-1",
```

---

## Step 2 - 체크리스트

### 2.1 seed.ts 수정
- [ ] members 배열 정의에서 partId 필드 제거
- [ ] Member upsert update 절에서 partId 제거
- [ ] Member upsert create 절에서 partId 제거
- [ ] TeamMembership upsert는 그대로 유지 (partId 사용)

### 2.2 auth.service.spec.ts 수정
- [ ] login 테스트에서 partId mock 데이터 제거
- [ ] login 테스트에서 part mock 객체 제거
- [ ] 테스트 로직 유지하면서 partId 없이 동작 확인

### 2.3 part-summary.service.spec.ts 수정
- [ ] mockMember에서 partId 필드 제거
- [ ] Member.partId 관련 테스트 설명 주석 업데이트

### 2.4 최종 통합 검증
- [ ] bun run build 성공 (전체 모노레포)
- [ ] cd packages/backend && bun run test 전체 통과
- [ ] bun run lint 오류 없음

---

## Step 3 - 완료 검증

```bash
# 전체 모노레포 빌드
bun run build

# 린트 확인
bun run lint

# 백엔드 단위 테스트
cd packages/backend && bun run test

# seed 실행 테스트 (선택 - 실제 DB 필요)
# cd packages/backend && bunx prisma db seed
```

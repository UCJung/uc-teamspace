# WORK-22-TASK-03: auth.service.ts 수정 - JWT payload에서 Member.partId 의존 제거

> **Phase:** 2
> **선행 TASK:** WORK-22-TASK-01
> **목표:** auth.service.ts에서 Member.partId와 Member.part relation에 대한 의존을 제거하고, JWT payload에서 단일 partId를 제거한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

auth.service.ts의 validateMember, login, refresh 메서드에서 member.partId와 member.part relation에 의존하는 코드를 정리한다. 현재 JWT payload에는 partId와 teamId가 포함되어 있는데, 다중 팀 소속 구조에서는 로그인 시점에 특정 팀/파트를 결정할 수 없다. 클라이언트에서 teamStore.currentTeamId로 팀을 관리하는 방식이 정식 설계이므로 JWT에서 partId를 제거한다.

**중요 고려사항**: JWT payload에서 teamId도 제거하거나 축소하는 방향을 검토한다. 현재 teamId는 Member.part.teamId에서 가져오는데 다중 팀 소속 시 의미가 없다. 단 teamId 제거 시 프론트엔드 영향도를 확인해야 한다. 안전하게 partId만 제거하고 teamId는 유지하되 null로 처리하는 방안도 검토한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/src/auth/auth.service.ts |
| 수정 | packages/backend/src/auth/strategies/jwt.strategy.ts |
| 수정 | packages/backend/src/auth/auth.service.spec.ts |

### 1.3 변경 상세

**validateMember (line 64-103)**

현재:
```ts
const member = await this.prisma.member.findUnique({
  where: { email },
  include: { part: { include: { team: true } } },  // <- 제거
});
```

**login 메서드 (line 106-150)**

현재:
```ts
async login(member: {
  partId: string | null;  // <- 제거
  part: { name: string; teamId: string; team: { name: string } } | null;  // <- 제거 또는 축소
}) {
  const payload = {
    partId: member.partId,  // <- 제거
    teamId: member.part?.teamId ?? null,  // <- null로 고정 또는 유지
  };
  return {
    user: {
      partId: member.partId,  // <- 제거
      partName: member.part?.name ?? null,  // <- 제거
      teamId: member.part?.teamId ?? null,
      teamName: member.part?.team?.name ?? null,
    }
  };
}
```

**refresh 메서드 (line 184-226)**

현재:
```ts
const member = await this.prisma.member.findUnique({
  where: { id: payload.sub },
  include: { part: true },  // <- 제거
});
const newPayload = {
  partId: member.partId,  // <- 제거
  teamId: member.part?.teamId ?? null,
};
```

**JwtPayload 인터페이스 (jwt.strategy.ts)**

현재:
```ts
export interface JwtPayload {
  partId: string;  // <- 제거
  teamId: string;
}
```

---

## Step 2 - 체크리스트

### 2.1 validateMember 수정
- [ ] include: { part: { include: { team: true } } } 제거
- [ ] 반환 타입에서 part 관련 필드 제거

### 2.2 login 메서드 수정
- [ ] 파라미터 타입에서 partId, part 필드 제거
- [ ] JWT payload에서 partId 제거
- [ ] 응답 user 객체에서 partId, partName 제거 (teamId, teamName은 후속 조회로 대체 또는 제거)

### 2.3 refresh 메서드 수정
- [ ] include: { part: true } 제거
- [ ] newPayload에서 partId 제거

### 2.4 JwtPayload 인터페이스 수정
- [ ] jwt.strategy.ts에서 partId 필드 제거
- [ ] validate 메서드 반환에서 partId 제거

### 2.5 테스트 수정
- [ ] auth.service.spec.ts login 테스트에서 partId mock 데이터 제거
- [ ] bun run test 전체 통과

---

## Step 3 - 완료 검증

```bash
# 백엔드 단위 테스트
cd packages/backend && bun run test

# 전체 빌드 확인
bun run build

# 린트 확인
bun run lint
```

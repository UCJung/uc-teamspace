# WORK-22-TASK-02: MemberService create/update에서 Member.partId 쓰기 제거

> **Phase:** 2
> **선행 TASK:** WORK-22-TASK-01
> **목표:** MemberService.create와 MemberService.update에서 Member.partId에 직접 쓰는 로직을 제거하고 TeamMembership.partId만 사용하도록 전환한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

현재 MemberService.create는 Member 생성 시 Member.partId를 직접 설정하며, MemberService.update도 Member.partId를 직접 갱신한다. Member.partId를 제거하고 TeamMembership.partId만으로 파트 소속을 관리하도록 변경한다. 단 TASK-04 이전이므로 DB 스키마는 변경하지 않고 코드에서의 쓰기만 제거한다.

**중요 고려사항**: create-member.dto.ts의 partId 필드는 TeamMembership 생성 시에는 여전히 필요하다. Member.partId에 쓰는 코드를 제거하되 TeamMembership 생성 흐름에서 partId를 활용하도록 유지한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/src/team/member.service.ts |
| 수정 | packages/backend/src/team/dto/create-member.dto.ts |
| 수정 | packages/backend/src/team/dto/update-member.dto.ts |
| 수정 | packages/backend/src/team/member.service.spec.ts |

### 1.3 변경 상세

**member.service.ts - create 메서드 (line 53-80)**

현재:
```ts
const member = await this.prisma.member.create({
  data: {
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
    roles: dto.roles,
    partId: dto.partId,  // <- 제거
  },
  include: { part: true },  // <- 제거
});
```

변경 후:
```ts
const member = await this.prisma.member.create({
  data: {
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
    roles: dto.roles,
    // partId 필드 제거
  },
});
```

**member.service.ts - update 메서드 (line 82-110)**

현재:
```ts
if (dto.partId !== undefined) data.partId = dto.partId;
```

변경 후: 해당 라인 제거 (Member.partId 직접 갱신 금지)

---

## Step 2 - 체크리스트

### 2.1 member.service.ts 수정
- [ ] create 메서드에서 data.partId 제거
- [ ] create 메서드에서 include: { part: true } 제거
- [ ] update 메서드에서 data.partId 설정 로직 제거
- [ ] update 메서드에서 include: { part: true } 제거

### 2.2 DTO 정리
- [ ] create-member.dto.ts: partId 필드 유지 (TeamMembership 생성 용도) - 주석 명확화
- [ ] update-member.dto.ts: partId 필드 제거 (Member.partId 직접 갱신 용도 아님)

### 2.3 테스트 수정
- [ ] member.service.spec.ts에서 partId mock 데이터 정리
- [ ] create/update 테스트에서 Member.partId 관련 검증 제거
- [ ] bun run test 전체 통과

---

## Step 3 - 완료 검증

```bash
# 백엔드 단위 테스트
cd packages/backend && bun run test

# 전체 빌드 확인
bun run build
```

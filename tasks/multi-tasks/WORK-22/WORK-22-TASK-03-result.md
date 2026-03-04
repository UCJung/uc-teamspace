# WORK-22-TASK-03 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

`auth.service.ts`에서 `Member.partId` 및 `Member.part` relation 의존을 제거했다. JWT payload에서 `partId`와 `teamId`를 제거하고, 로그인 응답의 `user` 객체에서도 이 필드를 null로 고정 반환하도록 변경했다. `jwt.strategy.ts`의 `JwtPayload` 인터페이스도 갱신하여 `partId`/`teamId`를 optional로 처리해 기존 발급 토큰과의 하위 호환을 유지했다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| validateMember에서 part include 제거 | ✅ |
| login 파라미터에서 partId/part 제거 | ✅ |
| JWT payload에서 partId/teamId 제거 | ✅ |
| 로그인 응답 user에서 partId/partName null 반환 | ✅ |
| refresh에서 part include 및 partId 제거 | ✅ |
| JwtPayload 인터페이스 partId optional 처리 | ✅ |
| validate 반환에서 partId/teamId 제거 | ✅ |
| auth.service.spec.ts 테스트 수정 | ✅ |
| bun run test 전체 통과 (157 tests) | ✅ |
| bun run build 성공 | ✅ |

---

## 3. 체크리스트 완료 현황

| 소분류 | 항목 | 상태 |
|--------|------|------|
| 2.1 validateMember | include: { part: { include: { team: true } } } 제거 | ✅ |
| 2.1 validateMember | 반환 타입에서 part 관련 필드 제거 | ✅ |
| 2.2 login | 파라미터 타입에서 partId, part 필드 제거 | ✅ |
| 2.2 login | JWT payload에서 partId 제거 | ✅ |
| 2.2 login | 응답 user 객체에서 partId/partName null로 고정 반환 | ✅ |
| 2.3 refresh | include: { part: true } 제거 | ✅ |
| 2.3 refresh | newPayload에서 partId 제거 | ✅ |
| 2.4 JwtPayload | jwt.strategy.ts에서 partId optional 처리 | ✅ |
| 2.4 JwtPayload | validate 반환에서 partId/teamId 제거 | ✅ |
| 2.5 테스트 | auth.service.spec.ts login 테스트 mock 데이터 수정 | ✅ |
| 2.5 테스트 | bun run test 전체 통과 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — 로그인 응답 user 객체에서 partId/partName 처리 방식

**증상**: 기존 `login()` 반환에서 `partId: member.partId`, `partName: member.part?.name` 등을 반환하고 있었음.

**원인**: 다중 팀 소속 구조에서는 로그인 시점에 특정 팀/파트를 결정할 수 없음. `teamId`도 `member.part?.teamId`에서 파생되므로 함께 제거 대상.

**수정**: 로그인 응답 user 객체에서 `partId: null`, `partName: null`, `teamId: null`, `teamName: null`로 고정 반환. 프론트엔드 타입도 `string | null`로 수정하여 null 처리 호환.

### 이슈 #2 — 기존 JWT 토큰 하위 호환

**증상**: 이미 발급된 JWT 토큰에 `partId`/`teamId` 클레임이 포함되어 있을 수 있음.

**원인**: JWT payload에서 필드를 제거하면 기존 토큰 검증 시 해당 필드가 undefined가 되어야 하나, JwtPayload 타입이 strict이면 타입 오류 발생 가능.

**수정**: `JwtPayload` 인터페이스에서 `partId?` / `teamId?`를 optional로 선언하여 기존 토큰에 이 필드가 있어도 오류가 발생하지 않도록 처리. `validate` 반환에서는 해당 필드를 포함하지 않음.

---

## 5. 최종 검증 결과

```
$ bun test src/
bun test v1.3.10

 157 pass
 0 fail
 313 expect() calls
Ran 157 tests across 15 files. [2.25s]
```

```
$ bun run build (backend)
nest build   → 성공

$ bun run build (frontend)
tsc -b && vite build
✓ 1766 modules transformed.
✓ built in 33.41s
```

```
$ bun run lint (전체)
Tasks: 3 successful, 3 total
(warnings only, 0 errors — 기존 pre-existing warnings)
```

---

## 6. 후속 TASK 유의사항

- **TASK-04 (Prisma 마이그레이션)** 에서 `Member.partId` 컬럼을 DB에서 제거할 때, `getMe` API도 `include: { part: ... }` 제거 필요. 현재 `getMe`는 schema에 `part` relation이 남아 있어 정상 동작하지만 TASK-04 이후에는 오류 발생.
- 프론트엔드 `user?.partId`를 사용하는 `Dashboard.tsx`, `PartStatus.tsx`, `ReportConsolidation.tsx`는 null 폴백(`?? ''`)이 이미 있어 즉각 오류 없음. 하지만 PART_LEADER의 파트 필터링이 빈 값으로 동작하므로 TASK-05 이후 TeamMembership API 기반으로 교체 권장.

---

## 7. 산출물 목록

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `packages/backend/src/auth/auth.service.ts` | validateMember에서 part include 제거, login 파라미터/payload/응답에서 partId/teamId 제거, refresh에서 part include/payload 필드 제거 |
| `packages/backend/src/auth/strategies/jwt.strategy.ts` | JwtPayload에서 partId/teamId optional 처리, validate 반환에서 partId/teamId 제거 |
| `packages/backend/src/auth/auth.service.spec.ts` | validateMember mock에서 part 필드 제거, login 테스트 mock/assertions 수정 |
| `packages/frontend/src/stores/authStore.ts` | User 인터페이스에서 partId/partName/teamId/teamName을 `string | null`로 변경 |
| `packages/frontend/src/api/auth.api.ts` | LoginResponse.user에서 partId/partName/teamId/teamName을 `string | null`로 변경 |

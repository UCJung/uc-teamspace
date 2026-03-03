# WORK-12-TASK-02: 백엔드 - 팀원 복수 역할 처리

## WORK
WORK-12: 프로젝트/파트 정렬 / 복수 역할 / 팀업무현황 제거 / 주차표현 통일

## Dependencies
- WORK-12-TASK-00 (required): Member.roles 배열 필드 필요

## Scope

### 1. DTO 수정

CreateMemberDto:
```typescript
// 변경 전
@IsEnum(MemberRole)
role: MemberRole;

// 변경 후
@IsArray()
@IsEnum(MemberRole, { each: true })
@ArrayMinSize(1, { message: '역할은 최소 1개 이상이어야 합니다.' })
roles: MemberRole[];
```

UpdateMemberDto:
```typescript
// 변경 전
@IsOptional()
@IsEnum(MemberRole)
role?: MemberRole;

// 변경 후
@IsOptional()
@IsArray()
@IsEnum(MemberRole, { each: true })
@ArrayMinSize(1)
roles?: MemberRole[];
```

### 2. MemberService 수정

findByTeam(): roles 배열 반환 (select에 roles 포함)

create():
```typescript
await prisma.member.create({
  data: { ..., roles: dto.roles }
})
```

update():
```typescript
if (dto.roles !== undefined) data.roles = dto.roles;
```

### 3. Auth Service / JWT Payload 수정

JWT payload에 roles 배열 포함:
```typescript
// JwtPayload 타입
interface JwtPayload {
  sub: string;       // memberId
  email: string;
  roles: string[];   // 변경: role -> roles
  teamId: string;
  partId: string;
}

// auth.service.ts validateUser()
// member.roles 배열을 payload에 포함
```

auth/me 엔드포인트 응답:
```json
{
  "id": "...",
  "name": "...",
  "email": "...",
  "roles": ["LEADER", "PART_LEADER"],
  "partId": "...",
  "partName": "...",
  "teamId": "..."
}
```

### 4. RolesGuard 수정

```typescript
// 변경 전: 단일 role 비교
const hasRole = () => user.role && requiredRoles.includes(user.role);

// 변경 후: roles 배열 중 하나라도 포함되면 허용
const hasRole = () =>
  user.roles && user.roles.some((r) => requiredRoles.includes(r));
```

### 5. 역할별 접근 정책 (RBAC)
- roles 배열에 'LEADER' 포함 -> 팀장 기능 전체 접근
- roles 배열에 'PART_LEADER' 포함 -> 파트장 기능 접근
- roles 배열에 'MEMBER'만 -> 일반 팀원 기능만
- 겸직 예: roles: ['LEADER', 'PART_LEADER'] -> 팀장 + 파트장 기능 모두 접근

## Files

| Path | Action | Description |
|------|--------|-------------|
| `packages/backend/src/team/dto/create-member.dto.ts` | MODIFY | role -> roles 배열 |
| `packages/backend/src/team/dto/update-member.dto.ts` | MODIFY | role? -> roles? 배열 |
| `packages/backend/src/team/member.service.ts` | MODIFY | roles 배열 처리 |
| `packages/backend/src/auth/auth.service.ts` | MODIFY | JWT payload roles 배열 |
| `packages/backend/src/common/guards/roles.guard.ts` | MODIFY | 배열 포함 여부 체크 |
| `packages/backend/src/auth/auth.controller.ts` | MODIFY | /me 응답 roles 포함 확인 |

## Acceptance Criteria
- [ ] POST /api/v1/members 로 roles: ["LEADER", "PART_LEADER"] 배열 저장 가능
- [ ] PATCH /api/v1/members/:id 로 roles 배열 수정 가능
- [ ] GET /api/v1/auth/me 응답에 roles: string[] 포함
- [ ] JWT 토큰에 roles 배열 인코딩됨
- [ ] RolesGuard가 roles 배열 중 하나라도 매칭 시 접근 허용
- [ ] 기존 단일 역할 기능 정상 동작 (회귀 없음)
- [ ] bun run build 성공
- [ ] bun run test 성공 (기존 테스트 회귀 없음)

## Verify
```bash
cd /c/rnd/weekly-report/packages/backend
bun run build
bun run test
```

# WORK-12-TASK-00: DB 스키마 변경 및 마이그레이션

## WORK
WORK-12: 프로젝트/파트 정렬 / 복수 역할 / 팀업무현황 제거 / 주차표현 통일

## Dependencies
없음

## Scope

### 1. Part 모델 - sortOrder 필드 추가
```prisma
model Part {
  id        String @id @default(cuid())
  name      String
  teamId    String
  sortOrder Int    @default(0)   // <-- 추가
  ...
}
```

### 2. Member 모델 - role 단일 enum -> roles 배열 변경
```prisma
// 변경 전
model Member {
  role MemberRole @default(MEMBER)
}

// 변경 후
model Member {
  roles MemberRole[] @default([MEMBER])
}
```

MemberRole enum 자체는 그대로 유지:
```prisma
enum MemberRole {
  LEADER
  PART_LEADER
  MEMBER
}
```

### 3. 마이그레이션 SQL 작성
기존 데이터 보존을 위해 수동 마이그레이션 SQL 작성:
- role 컬럼(enum) -> roles 컬럼(enum 배열) 데이터 변환
- PostgreSQL에서 enum 배열: `"MemberRole"[]`
- 변환 SQL 예시:
  ```sql
  -- roles 컬럼 추가
  ALTER TABLE members ADD COLUMN roles "MemberRole"[] DEFAULT ARRAY['MEMBER'::"MemberRole"];
  -- 기존 role 값을 배열로 복사
  UPDATE members SET roles = ARRAY[role];
  -- 기존 role 컬럼 제거
  ALTER TABLE members DROP COLUMN role;
  ```

### 4. seed.ts 수정
```typescript
// 변경 전
await prisma.member.create({ data: { role: MemberRole.LEADER, ... } })

// 변경 후
await prisma.member.create({ data: { roles: [MemberRole.LEADER], ... } })
```

## Files

| Path | Action | Description |
|------|--------|-------------|
| `packages/backend/prisma/schema.prisma` | MODIFY | Part.sortOrder 추가, Member.roles 배열로 변경 |
| `packages/backend/prisma/seed.ts` | MODIFY | roles 배열 형식으로 수정 |
| `packages/backend/prisma/migrations/YYYYMMDDHHMMSS_work12_part_sortorder_member_roles/migration.sql` | CREATE | 마이그레이션 SQL |

## Acceptance Criteria
- [ ] Part 모델에 sortOrder Int @default(0) 존재
- [ ] Member 모델에 roles MemberRole[] 필드 존재 (role 단일 필드 제거됨)
- [ ] 마이그레이션 적용 성공 (bunx prisma migrate dev)
- [ ] 기존 데이터 보존 (기존 role -> roles 배열 변환 완료)
- [ ] bunx prisma generate 성공 (Prisma Client 재생성)
- [ ] seed.ts 수정 완료

## Verify
```bash
cd /c/rnd/weekly-report/packages/backend
bunx prisma migrate dev --name work12_part_sortorder_member_roles
bunx prisma generate
bunx prisma migrate status
```

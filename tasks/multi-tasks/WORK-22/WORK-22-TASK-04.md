# WORK-22-TASK-04: Prisma 마이그레이션 - Member.partId 컬럼 제거

> **Phase:** 3
> **선행 TASK:** WORK-22-TASK-02, WORK-22-TASK-03
> **목표:** schema.prisma에서 Member.partId 및 Part.members relation을 제거하고 Prisma 마이그레이션을 통해 DB 컬럼을 제거한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

TASK-01~03에서 코드 레벨의 Member.partId 읽기/쓰기를 모두 제거한 후 이 단계에서 DB 스키마에서 실제 컬럼을 제거한다. Prisma schema에서 Member.partId 필드와 Part.members(Member[] relation)를 제거하고 마이그레이션을 생성한다.

**마이그레이션 주의사항**: 기존 DB에 Member.partId 데이터가 있을 경우 TeamMembership.partId와 정합성을 확인해야 한다. seed.ts가 두 필드를 동시에 설정하므로 일반적으로 정합성이 유지되어 있다. 그러나 안전을 위해 마이그레이션 전 검증 SQL을 포함한다.

**데이터 정합성 검증 SQL**:
```sql
-- Member.partId와 TeamMembership.partId가 불일치하는 경우 확인
SELECT m.id, m.name, m.partId as member_partId, tm.partId as tm_partId
FROM members m
LEFT JOIN team_memberships tm ON tm.member_id = m.id
WHERE m.partId IS NOT NULL AND m.partId != tm.partId;
```

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/prisma/schema.prisma |
| 생성 | packages/backend/prisma/migrations/YYYYMMDDHHMMSS_remove_member_partid/ |

### 1.3 스키마 변경 상세

**Member 모델에서 제거**:
```prisma
// 제거할 필드들
partId   String?        // <- 제거
part     Part?  @relation(fields: [partId], references: [id])  // <- 제거
```

**Part 모델에서 제거**:
```prisma
members  Member[]  // <- 제거 (Part.members relation - Member.partId 기반)
```

---

## Step 2 - 체크리스트

### 2.1 스키마 수정
- [ ] schema.prisma Member 모델에서 partId 필드 제거
- [ ] schema.prisma Member 모델에서 part 관계 제거
- [ ] schema.prisma Part 모델에서 members 관계 제거
- [ ] prisma format 또는 prisma validate 통과

### 2.2 마이그레이션 실행
- [ ] 마이그레이션 전 데이터 정합성 검증 SQL 실행 (불일치 건 확인)
- [ ] bunx prisma migrate dev --name remove_member_partid 실행
- [ ] 마이그레이션 파일 내용 검토 (ALTER TABLE members DROP COLUMN part_id)
- [ ] bunx prisma generate 실행

### 2.3 빌드 검증
- [ ] bun run build 성공
- [ ] 린트 오류 없음
- [ ] bun run test 통과

---

## Step 3 - 완료 검증

```bash
# 데이터 정합성 확인 (마이그레이션 전)
# bunx prisma db execute --file check_data.sql

# 마이그레이션 실행
cd packages/backend
bunx prisma migrate dev --name remove_member_partid
bunx prisma generate

# 전체 빌드
bun run build

# 테스트
bun run test

# 스키마 확인
bunx prisma validate
```

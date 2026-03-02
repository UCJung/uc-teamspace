# WORK-13-TASK-00: DB 스키마 변경 + 마이그레이션

> 의존: 없음
> 상태: PENDING

## 목표

PartSummary/SummaryWorkItem 모델을 확장하여 팀 단위 취합과 팀원 이름 추적을 지원한다.

---

## Step 1 — 체크리스트

### 1.1 PartSummary 모델 확장
- [ ] `partId` nullable로 변경 (`String?`)
- [ ] `teamId String?` 필드 추가
- [ ] `scope SummaryScope @default(PART)` 필드 추가
- [ ] `title String?` 필드 추가
- [ ] `team Team? @relation(...)` 관계 추가
- [ ] `part` 관계를 optional로 변경 (`Part?`)
- [ ] 기존 `@@unique([partId, weekStart])` 유지

### 1.2 SummaryWorkItem 모델 확장
- [ ] `memberNames String? @db.Text` 필드 추가 (병합된 팀원 이름, 쉼표 구분)

### 1.3 신규 enum
- [ ] `SummaryScope` enum 생성 (PART, TEAM)

### 1.4 Team 모델 관계 추가
- [ ] `partSummaries PartSummary[]` 관계 추가

### 1.5 마이그레이션
- [ ] `prisma migrate dev` 성공
- [ ] `prisma generate` 성공
- [ ] 기존 데이터 보존 확인 (scope=PART 자동 설정)

---

## Step 2 — 상세 스키마

### PartSummary 확장
```prisma
model PartSummary {
  id        String       @id @default(cuid())
  partId    String?                           // nullable로 변경
  teamId    String?                           // 신규
  scope     SummaryScope @default(PART)       // 신규
  weekStart DateTime
  weekLabel String
  title     String?                           // 신규
  status    ReportStatus @default(DRAFT)

  part             Part?              @relation(fields: [partId], references: [id])
  team             Team?              @relation(fields: [teamId], references: [id])
  summaryWorkItems SummaryWorkItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([partId, weekStart])
  @@map("part_summaries")
}
```

### SummaryWorkItem 확장
```prisma
model SummaryWorkItem {
  id            String @id @default(cuid())
  partSummaryId String
  projectId     String

  doneWork    String  @db.Text
  planWork    String  @db.Text
  remarks     String? @db.Text
  memberNames String? @db.Text   // 신규
  sortOrder   Int     @default(0)

  partSummary PartSummary @relation(fields: [partSummaryId], references: [id], onDelete: Cascade)
  project     Project     @relation(fields: [projectId], references: [id])

  @@map("summary_work_items")
}
```

### 신규 enum
```prisma
enum SummaryScope {
  PART
  TEAM
}
```

### Team 관계 추가
```prisma
model Team {
  ...기존...
  partSummaries PartSummary[]
}
```

---

## Step 3 — 완료 검증

```bash
cd /c/rnd/weekly-report/packages/backend

# 1. 마이그레이션 적용
bunx prisma migrate dev --name work13_summary_scope

# 2. Prisma Client 재생성
bunx prisma generate

# 3. 빌드 확인
bun run build
```

---

## 산출물

| Path | Action | Description |
|------|--------|-------------|
| `packages/backend/prisma/schema.prisma` | MODIFY | PartSummary/SummaryWorkItem 확장, SummaryScope enum, Team 관계 |
| `packages/backend/prisma/migrations/*/migration.sql` | CREATE | 마이그레이션 파일 |

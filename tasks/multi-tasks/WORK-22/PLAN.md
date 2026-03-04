# WORK-22: Member.partId 이중 관리 제거 - TeamMembership 기반 단일화

> Created: 2026-03-04
> Project: UC TeamSpace
> Tech Stack: NestJS 11 / Prisma 6 / PostgreSQL 16 / Bun
> Status: PLANNED

## 요청사항

ISSUE-08: Member.partId / TeamMembership.partId 이중 관리 문제를 해결하기 위한 WORK-22 계획을 수립한다.

현재 상태:
- Member 모델에 partId 필드가 있고 TeamMembership에도 partId 필드가 있다
- 두 필드가 동시에 존재하며 일부 서비스는 Member.partId를 참조하고 다른 서비스는 TeamMembership.partId를 참조
- CLAUDE.md 12.9 섹션에서는 TeamMembership 기반 다중 팀 소속 구조가 정식 설계
- 구 Member.partId 필드가 제거되지 않고 병행 사용 중 - 데이터 불일치 위험

---

## 코드 분석 결과 (Member.partId 사용처 전수조사)

### A. 직접 Member.partId를 쿼리 조건으로 사용하는 코드 (핵심 문제)

| 파일 | 줄 | 문제 | 대체 방안 |
|------|-----|------|-----------|
| part-summary.service.ts | 179 | where: { partId, isActive: true } (Member 모델 직접 필터) | TeamMembership 기반으로 대체 |
| part-summary.service.ts | 253 | where: { partId, isActive: true } (Member 모델 직접 필터) | TeamMembership 기반으로 대체 |
| part-summary.service.ts | 385 | memberFilter = { partId: summary.partId, isActive: true } | TeamMembership 기반으로 대체 |
| part-summary.service.ts | 205-210 | getTeamMembersWeeklyStatus에서 Part.members relation 사용 | Part -> TeamMembership 경유로 대체 |
| part-summary.service.ts | 279-282 | getTeamWeeklyOverview에서 Part.members relation 사용 | Part -> TeamMembership 경유로 대체 |
| member.service.ts | 72 | partId: dto.partId (Member.create) | Member 생성 시 partId 제거 |
| member.service.ts | 95 | data.partId = dto.partId (Member.update) | Member 업데이트 시 TeamMembership만 갱신 |

### B. Member.partId를 JWT payload / 응답에 포함하는 코드

| 파일 | 줄 | 설명 |
|------|-----|------|
| auth.service.ts | 112, 119 | partId: member.partId (login 메서드) - 다중팀 시 부정확 |
| auth.service.ts | 144 | partId: member.partId (login 응답 user 객체) |
| auth.service.ts | 209 | partId: member.partId (refresh 메서드) |
| auth.service.ts | 64-68 | include: { part: ... } (validateMember) - Member.part relation으로 part 조회 |
| auth.service.ts | 197-199 | include: { part: true } (refresh) |
| jwt.strategy.ts | 10, 29 | partId: string (JwtPayload 인터페이스) |

### C. seed.ts에서 Member.partId 사용

| 줄 | 코드 | 설명 |
|-----|------|------|
| 56-65 | { partId: dxPart.id } 등 | Member 생성 시 partId 포함 |
| 71 | partId: m.partId (upsert update) | Member update에 partId 포함 |
| 77 | partId: m.partId (upsert create) | Member create에 partId 포함 |

### D. DTO에서 Member.partId 관련 필드

| 파일 | 필드 | 설명 |
|------|------|------|
| create-member.dto.ts | partId: string (required) | 팀원 등록 시 필수 partId - Member에 직접 저장됨 |
| update-member.dto.ts | partId?: string | 팀원 수정 시 Member.partId 직접 갱신 |

### E. TeamMembership.partId를 올바르게 사용하는 코드 (이미 정상)

- member.service.ts - findByTeam: TeamMembership 기반으로 올바르게 구현됨
- team-join.service.ts - reviewJoinRequest: TeamMembership.create 시 partId 올바르게 설정
- team-join.service.ts - getMyTeams: TeamMembership.part 기반으로 반환
- part-summary.service.ts - autoMerge: TeamMembership 기반으로 올바르게 구현됨
- timesheet-stats.service.ts: TeamMembership 기반으로 올바르게 구현됨

---

## 핵심 문제점 요약

### 문제 1: getPartWeeklyStatus (part-summary.service.ts:175-200)

현재 코드: prisma.member.findMany({ where: { partId, isActive: true } })

영향: 팀원이 TeamMembership으로 파트에 배정되어 있어도 Member.partId가 다르면 조회에서 누락됨.

### 문제 2: getPartSubmissionStatus (part-summary.service.ts:249-270)

동일 패턴. Member.partId 기반으로 파트 소속 팀원을 조회함.

### 문제 3: loadMemberRows (part-summary.service.ts:384-385)

memberFilter = { partId: summary.partId, isActive: true } 형태로 Member.partId 직접 사용.

### 문제 4: getTeamMembersWeeklyStatus / getTeamWeeklyOverview

Part 모델의 members relation (Member.partId 기반)으로 팀원을 조회. TeamMembership 기반이 아님.

### 문제 5: MemberService.create / update

TeamMembership은 별도로 관리되는데 Member.partId도 함께 쓰고 있어 이중 관리 발생.

### 문제 6: auth.service.ts - 단일 팀 기준의 JWT partId

로그인 시 member.partId (전역 단일 partId)를 JWT에 포함하여 다중 팀 시나리오에서 부정확.

---

## 마이그레이션 전략

단계별 접근 (안전 우선):

1. TASK-01: 코드 수정 - part-summary.service.ts에서 Member.partId 읽기를 TeamMembership 기반으로 전환
2. TASK-02: Member.create/update에서 partId 제거 TeamMembership 동기화
3. TASK-03: auth.service.ts 수정 (JWT payload에서 Member.partId 제거)
4. TASK-04: DB 마이그레이션 (Member.partId 컬럼 제거 + 데이터 정합성 검증)
5. TASK-05: seed.ts 수정 + 테스트 코드 전체 정비

핵심 원칙:
- TASK-01~03은 코드 레벨 변경 (DB 스키마 변경 없음, Member.partId는 nullable이므로 빌드 가능)
- TASK-04에서 Prisma 마이그레이션으로 컬럼 제거 (TASK-01~03 완료 후)
- 롤백: 각 TASK는 독립 커밋으로 TASK-04 이전까지는 DB 변경 없이 롤백 가능

---

## Task Dependency Graph

```
TASK-01 (part-summary 쿼리 수정)
    |
    +------> TASK-02 (member create/update 수정)
    |               |
    +------> TASK-03 (auth/JWT 수정)
                    |
        (TASK-02 + TASK-03 모두 완료 후)
                    |
                    v
         TASK-04 (DB 마이그레이션 - Member.partId 컬럼 제거)
                    |
                    v
         TASK-05 (seed.ts + 테스트 코드 정비)
```

---

## Tasks

### WORK-22-TASK-01: part-summary.service.ts 쿼리 TeamMembership 기반으로 전환
- **Depends on**: (없음)
- **Scope**: getPartWeeklyStatus, getPartSubmissionStatus, loadMemberRows(PART scope), getTeamMembersWeeklyStatus, getTeamWeeklyOverview에서 Member.partId 기반 쿼리를 TeamMembership 기반으로 전환
- **Files**:
  - packages/backend/src/weekly-report/part-summary.service.ts - 쿼리 5곳 수정
  - packages/backend/src/weekly-report/part-summary.service.spec.ts - 관련 테스트 수정
- **Acceptance Criteria**:
  - [ ] Member.partId 조건 쿼리 4곳 모두 TeamMembership 기반으로 대체
  - [ ] Part.members relation 직접 사용 2곳을 TeamMembership 경유로 대체
  - [ ] 단위 테스트 통과
- **Verify**: cd packages/backend && bun run test

### WORK-22-TASK-02: MemberService create/update에서 Member.partId 쓰기 제거
- **Depends on**: WORK-22-TASK-01
- **Scope**: MemberService.create와 MemberService.update에서 Member.partId에 직접 쓰는 로직을 제거하고 TeamMembership.partId만 사용하도록 전환. DTO 정리.
- **Files**:
  - packages/backend/src/team/member.service.ts - create/update 수정
  - packages/backend/src/team/dto/create-member.dto.ts - partId 처리 방식 조정
  - packages/backend/src/team/dto/update-member.dto.ts - partId 처리 방식 조정
  - packages/backend/src/team/member.service.spec.ts - 테스트 수정
- **Acceptance Criteria**:
  - [ ] MemberService.create에서 Member.partId 쓰기 제거
  - [ ] MemberService.update에서 Member.partId 쓰기 제거 TeamMembership 갱신으로 대체
  - [ ] 단위 테스트 통과
- **Verify**: cd packages/backend && bun run test

### WORK-22-TASK-03: auth.service.ts 수정 - JWT payload에서 Member.partId 의존 제거
- **Depends on**: WORK-22-TASK-01
- **Scope**: auth.service.ts의 validateMember, login, refresh에서 member.partId / member.part 참조를 제거. JWT payload에서 단일 partId를 제거.
- **Files**:
  - packages/backend/src/auth/auth.service.ts - partId 참조 제거
  - packages/backend/src/auth/strategies/jwt.strategy.ts - JwtPayload에서 partId 제거
  - packages/backend/src/auth/auth.service.spec.ts - 테스트 수정
- **Acceptance Criteria**:
  - [ ] JWT payload에서 partId 제거
  - [ ] validateMember에서 include: { part } 제거
  - [ ] refresh에서 include: { part } 제거
  - [ ] JwtPayload 인터페이스에서 partId 필드 제거
  - [ ] 단위 테스트 통과
- **Verify**: cd packages/backend && bun run test

### WORK-22-TASK-04: Prisma 마이그레이션 - Member.partId 컬럼 제거
- **Depends on**: WORK-22-TASK-02, WORK-22-TASK-03
- **Scope**: schema.prisma에서 Member.partId 및 Part.members relation 제거. 마이그레이션 파일 생성.
- **Files**:
  - packages/backend/prisma/schema.prisma - Member 모델 partId part 관계 제거
  - packages/backend/prisma/migrations/ - 신규 마이그레이션 파일
- **Acceptance Criteria**:
  - [ ] schema.prisma에서 Member.partId 제거
  - [ ] schema.prisma에서 Part.members (Member[] relation) 제거
  - [ ] bunx prisma migrate dev 성공
  - [ ] bunx prisma generate 성공
  - [ ] 빌드 성공
- **Verify**: cd packages/backend && bunx prisma migrate dev --name remove_member_partid && bunx prisma generate && bun run build

### WORK-22-TASK-05: seed.ts 수정 + 테스트 코드 전체 정비
- **Depends on**: WORK-22-TASK-04
- **Scope**: seed.ts에서 Member 생성 시 partId 제거. 각 서비스 단위 테스트에서 Member.partId 관련 mock 데이터 정리. 전체 빌드 및 테스트 최종 확인.
- **Files**:
  - packages/backend/prisma/seed.ts - Member upsert에서 partId 제거
  - packages/backend/src/auth/auth.service.spec.ts - partId mock 데이터 정리
  - packages/backend/src/weekly-report/part-summary.service.spec.ts - mockMember.partId 제거
- **Acceptance Criteria**:
  - [ ] seed.ts에서 Member 생성/수정 시 partId 완전 제거
  - [ ] 모든 단위 테스트 통과
  - [ ] 전체 빌드 성공
- **Verify**: bun run build && cd packages/backend && bun run test

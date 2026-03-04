# WORK-22 Progress

> WORK: Member.partId 이중 관리 제거 - TeamMembership 기반 단일화
> Last updated: 2026-03-04

| TASK | Title | Depends | Status | Commit | Note |
|------|-------|---------|--------|--------|------|
| WORK-22-TASK-01 | part-summary.service.ts 쿼리 TeamMembership 기반으로 전환 | - | Pending | | |
| WORK-22-TASK-02 | MemberService create/update에서 Member.partId 쓰기 제거 | TASK-01 | Pending | | |
| WORK-22-TASK-03 | auth.service.ts 수정 - JWT payload에서 Member.partId 의존 제거 | TASK-01 | Pending | | |
| WORK-22-TASK-04 | Prisma 마이그레이션 - Member.partId 컬럼 제거 | TASK-02, TASK-03 | Pending | | |
| WORK-22-TASK-05 | seed.ts 수정 + 테스트 코드 전체 정비 | TASK-04 | Pending | | |

## Log

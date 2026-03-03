# WORK-12-TASK-01: 백엔드 - 프로젝트/파트 정렬순서 API

## WORK
WORK-12: 프로젝트/파트 정렬 / 복수 역할 / 팀업무현황 제거 / 주차표현 통일

## Dependencies
- WORK-12-TASK-00 (required): Part.sortOrder 필드 필요

## Scope

### 1. 프로젝트 일괄 재정렬 API
엔드포인트: PATCH /api/v1/projects/reorder

Request Body:
```json
{
  "teamId": "clxxxxxx",
  "orderedIds": ["id_project_1", "id_project_2", "id_project_3"]
}
```

처리 로직:
- orderedIds 배열의 인덱스를 각 프로젝트의 sortOrder로 저장
- Prisma $transaction()으로 원자적 일괄 업데이트
- 권한: LEADER 전용

```typescript
// ReorderProjectsDto
export class ReorderProjectsDto {
  @IsString()
  teamId: string;

  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}

// ProjectService.reorder()
async reorder(dto: ReorderProjectsDto) {
  return this.prisma.$transaction(
    dto.orderedIds.map((id, index) =>
      this.prisma.project.update({ where: { id }, data: { sortOrder: index } })
    )
  );
}
```

### 2. 파트 일괄 재정렬 API
엔드포인트: PATCH /api/v1/teams/:teamId/parts/reorder

Request Body:
```json
{
  "orderedIds": ["partId_1", "partId_2"]
}
```

처리 로직:
- orderedIds 배열의 인덱스를 각 파트의 sortOrder로 저장
- Prisma $transaction()으로 원자적 일괄 업데이트
- 권한: LEADER 전용

### 3. 파트 목록 정렬 수정
team.service.ts의 findParts():
```typescript
// 변경 전: orderBy 없음 또는 다른 기준
// 변경 후:
orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
```

## Files

| Path | Action | Description |
|------|--------|-------------|
| `packages/backend/src/project/dto/reorder-projects.dto.ts` | CREATE | ReorderProjectsDto |
| `packages/backend/src/project/project.service.ts` | MODIFY | reorder() 메서드 추가 |
| `packages/backend/src/project/project.controller.ts` | MODIFY | PATCH reorder 엔드포인트 추가 |
| `packages/backend/src/team/dto/reorder-parts.dto.ts` | CREATE | ReorderPartsDto |
| `packages/backend/src/team/team.service.ts` | MODIFY | reorderParts() 추가, findParts() 정렬 수정 |
| `packages/backend/src/team/team.controller.ts` | MODIFY | PATCH parts/reorder 엔드포인트 추가 |

## Acceptance Criteria
- [ ] PATCH /api/v1/projects/reorder 호출 시 orderedIds 순서대로 sortOrder 업데이트됨
- [ ] PATCH /api/v1/teams/:teamId/parts/reorder 호출 시 Part.sortOrder 업데이트됨
- [ ] GET /api/v1/teams/:teamId/parts 응답이 sortOrder 오름차순 정렬
- [ ] 두 엔드포인트 모두 LEADER 권한 필요
- [ ] bun run build 성공

## Verify
```bash
cd /c/rnd/weekly-report/packages/backend
bun run build
```

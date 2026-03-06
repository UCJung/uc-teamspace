# WORK-28 TASK-02 — 백엔드: PersonalTask 내용 → WorkItem 반영 API

## 목표
선택한 PersonalTask 목록의 내용을 WorkItem의 doneWork/planWork에 반영하는 API를 추가한다.

## 수정 파일

| 파일 | 작업 |
|------|------|
| `packages/backend/src/weekly-report/work-item.service.ts` | `applyTasksToWorkItem()` 메서드 추가 |
| `packages/backend/src/weekly-report/report.controller.ts` | `POST /api/v1/work-items/:id/apply-tasks` 엔드포인트 추가 |
| `packages/backend/src/weekly-report/dto/apply-tasks.dto.ts` | 신규 DTO 파일 |

## 구현 상세

### DTO: ApplyTasksDto

```typescript
export class ApplyTasksDto {
  @IsArray()
  @IsString({ each: true })
  taskIds: string[];

  @IsEnum(['replace', 'append'])
  appendMode: 'replace' | 'append';

  @IsString()
  teamId: string;
}
```

### POST /api/v1/work-items/:id/apply-tasks

**흐름:**
1. `workItem` 조회 + 본인 소유 확인
2. `taskIds`에 해당하는 `PersonalTask` 조회 (본인 소유 + 미삭제)
3. 카테고리별 분류:
   - `COMPLETED` 카테고리 → `doneWork` 텍스트 생성
   - `IN_PROGRESS` / `BEFORE_START` 카테고리 → `planWork` 텍스트 생성
4. 텍스트 생성 규칙:
   ```
   [프로젝트명 없는 경우 단순 목록]
   *작업제목1
   *작업제목2

   [memo가 있는 경우]
   *작업제목1
   ㄴ메모내용
   ```
5. `appendMode`:
   - `replace`: 기존 내용 완전 교체
   - `append`: 기존 내용 뒤에 줄바꿈으로 추가
6. `WorkItem` 업데이트 후 반환

**응답:** 업데이트된 `WorkItem` 객체

**권한:** JWT 인증, 본인 WorkItem만 수정 가능

## 완료 기준
- [ ] `POST /api/v1/work-items/:id/apply-tasks` 정상 동작
- [ ] `appendMode: 'replace'` 시 기존 내용 교체
- [ ] `appendMode: 'append'` 시 기존 내용 뒤에 추가
- [ ] COMPLETED 작업 → doneWork, 나머지 → planWork 분류 정확
- [ ] `bun run build` 오류 없음

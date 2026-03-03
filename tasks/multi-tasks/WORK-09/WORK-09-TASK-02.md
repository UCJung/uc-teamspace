# WORK-09-TASK-02: 행 액션 드롭다운에 업무추가/프로젝트제거 통합

## WORK
WORK-09: 주간업무 그리드 통합 테이블 UI 전환

## Dependencies
- WORK-09-TASK-01 (통합 테이블 구조 재작성 완료 필요)

## Scope

TASK-01에서 제거된 그룹 헤더의 "업무 추가"와 "프로젝트 제거" 기능을
각 행의 액션 드롭다운 메뉴(`DropdownMenuContent`)에 통합한다.

- "업무 추가": 모든 행의 드롭다운에 표시. 클릭 시 해당 projectId로 `onAddItem` 호출
- "프로젝트 제거": 해당 프로젝트의 마지막 행에만 표시. 클릭 시 `deleteProjectTarget` 확인 모달 열기

## Files

| Path | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/components/grid/EditableGrid.tsx` | MODIFY | 액션 드롭다운에 업무추가/프로젝트제거 통합 |

## 상세 구현 가이드

### 변경 후 드롭다운 메뉴 구조

```tsx
<DropdownMenuContent align="end">
  {/* 1. 확대 편집 (기존 유지) */}
  <DropdownMenuItem
    onSelect={() => {
      const col: 'doneWork' | 'planWork' | 'remarks' =
        editingCell?.rowId === item.id ? editingCell.column : 'doneWork';
      setExpandedCell({ rowId: item.id, column: col });
    }}
  >
    <span className="mr-1.5">↗</span>
    확대 편집
  </DropdownMenuItem>

  {/* 2. 업무 추가 (신규) */}
  <DropdownMenuItem
    onSelect={() => onAddItem(item.projectId ?? '')}
  >
    <span className="mr-1.5">+</span>
    업무 추가
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  {/* 3. 행 삭제 (기존 유지) */}
  <DropdownMenuItem
    onSelect={() => setDeleteTarget(item.id)}
    className="text-[var(--danger)] hover:bg-[var(--danger-bg)] focus:bg-[var(--danger-bg)]"
  >
    <span className="mr-1.5">✕</span>
    행 삭제
  </DropdownMenuItem>

  {/* 4. 프로젝트 제거 — 마지막 행에만 표시 (신규) */}
  {isLastInGroup && (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={() => setDeleteProjectTarget(group)}
        className="text-[var(--danger)] hover:bg-[var(--danger-bg)] focus:bg-[var(--danger-bg)]"
      >
        <span className="mr-1.5">🗑</span>
        프로젝트 제거
      </DropdownMenuItem>
    </>
  )}
</DropdownMenuContent>
```

### 변수 참조 확인

- `item.projectId`: WorkItem의 projectId (string | null | undefined)
- `isLastInGroup`: TASK-01에서 이미 정의한 `itemIdx === group.items.length - 1`
- `group`: 현재 순회 중인 ProjectGroup 객체 (deleteProjectTarget 모달에 전달)
- `onAddItem`: EditableGridProps에서 받는 콜백 `(projectId: string) => void`

### 기존 ConfirmModal 재확인 (변경 없음)

```tsx
{/* 프로젝트 그룹 삭제 확인 — 기존 코드 유지 */}
<ConfirmModal
  open={!!deleteProjectTarget}
  onClose={() => setDeleteProjectTarget(null)}
  onConfirm={() => {
    onDeleteProject(deleteProjectTarget!.projectId);
    setDeleteProjectTarget(null);
  }}
  title="프로젝트 제거"
  message={`[${deleteProjectTarget?.project?.name ?? ''}] 프로젝트의 업무항목 ${deleteProjectTarget?.items.length ?? 0}개가 모두 삭제됩니다. 계속하시겠습니까?`}
  confirmLabel="제거"
  danger
/>
```

### 엣지 케이스 처리

1. `item.projectId`가 null/undefined인 경우:
   - "업무 추가" onSelect: `onAddItem('')` 호출 — 빈 문자열 전달 (기존 동작과 동일)
   - "프로젝트 제거"는 표시되나 실제로는 `deleteByProjectMutation`에서 처리됨

2. 프로젝트에 업무가 1개뿐인 행:
   - `isFirstInGroup === true && isLastInGroup === true`
   - 드롭다운에 "업무 추가" + "행 삭제" + "프로젝트 제거" 모두 표시됨
   - "행 삭제" 후 해당 프로젝트 그룹이 자동으로 사라짐 (workItems 업데이트 → groups 재계산)

3. disabled 상태:
   - `!disabled` 조건으로 드롭다운 전체 숨김 (기존 동작 유지)

## Acceptance Criteria

- [ ] 모든 행의 드롭다운에 "업무 추가" 메뉴 항목이 표시됨
- [ ] "업무 추가" 클릭 시 해당 프로젝트에 빈 업무 행이 추가됨 (API 호출 성공)
- [ ] 프로젝트 마지막 행에만 "프로젝트 제거" 메뉴 항목이 표시됨
- [ ] 첫 번째 행(마지막이 아닌 경우)에는 "프로젝트 제거" 항목이 없음
- [ ] "프로젝트 제거" 클릭 시 확인 모달이 열림
- [ ] 확인 모달에서 "제거" 클릭 시 해당 프로젝트의 모든 업무가 삭제되고 테이블에서 제거됨
- [ ] 프로젝트의 마지막 업무 행을 "행 삭제"로 삭제하면 해당 프로젝트 그룹 전체가 사라짐
- [ ] disabled=true 시 드롭다운이 표시되지 않음
- [ ] `bun run --filter=frontend build` 성공
- [ ] `bun run --filter=frontend lint` 성공

## Verify

```bash
cd /c/rnd/weekly-report && bun run --filter=frontend build 2>&1 | tail -20
cd /c/rnd/weekly-report && bun run --filter=frontend lint 2>&1 | tail -20
```

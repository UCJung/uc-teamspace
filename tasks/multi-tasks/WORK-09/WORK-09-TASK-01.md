# WORK-09-TASK-01: EditableGrid 통합 테이블 구조 재작성

## WORK
WORK-09: 주간업무 그리드 통합 테이블 UI 전환

## Dependencies
- 없음

## Scope

`EditableGrid.tsx`의 렌더링 구조를 프로젝트별 분리 테이블에서 단일 통합 테이블로 전환한다.
프로젝트명은 첫 번째 컬럼(`project`)에 위치하며, 해당 프로젝트의 첫 번째 업무 행에만 pill 배지로 표시한다.
프로젝트 그룹 경계는 마지막 행 하단의 굵은 구분선(`border-b-2`)으로 시각화한다.
기존 그룹 헤더 div(업무 추가 버튼, 프로젝트 제거 버튼 포함)는 제거한다.

## Files

| Path | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/components/grid/EditableGrid.tsx` | MODIFY | 통합 테이블 구조로 재작성 |

## 상세 구현 가이드

### 1. COLUMNS 배열 변경

```ts
// 변경 전
const COLUMNS = [
  { id: 'index',    label: '#',                   width: '4%' },
  { id: 'doneWork', label: '진행업무 (한일)',       width: '33%' },
  { id: 'planWork', label: '예정업무 (할일)',       width: '33%' },
  { id: 'remarks',  label: '비고 및 이슈',          width: '24%' },
  { id: 'action',   label: '',                     width: '6%' },
];

// 변경 후
const COLUMNS = [
  { id: 'project',  label: '프로젝트',             width: '13%' },
  { id: 'doneWork', label: '진행업무 (한일)',       width: '30%' },
  { id: 'planWork', label: '예정업무 (할일)',       width: '30%' },
  { id: 'remarks',  label: '비고 및 이슈',          width: '20%' },
  { id: 'action',   label: '',                     width: '7%' },
];
```

### 2. JSX 렌더링 구조

```tsx
return (
  <div className="flex flex-col gap-0">
    {workItems.length === 0 && (
      <div ...>안내 메시지</div>
    )}

    {workItems.length > 0 && (
      <div className="rounded-lg border border-[var(--gray-border)] overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              {COLUMNS.map(col => <col key={col.id} style={{ width: col.width }} />)}
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: 'var(--tbl-header)' }}>
                {COLUMNS.map(col => (
                  <th key={col.id} className="text-left px-3 py-[7px] text-[11px] font-semibold border-b border-[var(--gray-border)] whitespace-nowrap tracking-wide uppercase" style={{ color: 'var(--text-sub)' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) =>
                group.items.map((item, itemIdx) => {
                  const isFirstInGroup = itemIdx === 0;
                  const isLastInGroup = itemIdx === group.items.length - 1;
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors"
                      style={{
                        backgroundColor: 'white',
                        borderBottom: isLastInGroup
                          ? '2px solid var(--gray-border)'
                          : '1px solid var(--gray-border)',
                      }}
                      onMouseEnter={...}
                      onMouseLeave={...}
                    >
                      {/* 프로젝트 컬럼 */}
                      <td
                        className="px-3 py-[8px] align-top"
                        style={{ backgroundColor: 'var(--tbl-header)' }}
                      >
                        {isFirstInGroup && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight"
                            style={{
                              backgroundColor: 'var(--primary-bg)',
                              color: 'var(--primary)',
                              border: '1px solid var(--primary)',
                            }}
                          >
                            {group.project?.name ?? '(프로젝트 없음)'}
                          </span>
                        )}
                      </td>

                      {/* 진행업무 */}
                      <td className="px-3 py-[8px] align-top text-[12.5px]">
                        <GridCell ... />
                      </td>

                      {/* 예정업무 */}
                      <td className="px-3 py-[8px] align-top text-[12.5px]">
                        <GridCell ... />
                      </td>

                      {/* 비고 */}
                      <td className="px-3 py-[8px] align-top text-[12.5px]">
                        <GridCell ... />
                      </td>

                      {/* 액션 — TASK-02에서 채움. 일단 기존 DropdownMenu 유지 */}
                      <td className="px-2 py-[8px] align-top text-center">
                        {!disabled && <DropdownMenu>...</DropdownMenu>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* ExpandedEditor, ConfirmModal 유지 */}
  </div>
);
```

### 3. 제거 대상

- `groups.map(group => <div key=group.projectId> ... </div>)` 전체 div 구조
- 그룹 헤더 (`<div className="flex items-center gap-3 px-4 py-2.5 ...">`) 전체
- 각 그룹의 독립 `<table>`, `<colgroup>`, `<thead>`, `<tbody>` 래퍼

### 4. 유지 대상

- `groups` useMemo 로직 (projectId 기준 grouping)
- `startEdit`, `endEdit`, `handleSave` 콜백
- `GridCell` 컴포넌트 연결
- `expandedCell` 상태 및 `ExpandedEditor`
- `deleteTarget` 상태 및 행 삭제 ConfirmModal
- `deleteProjectTarget` 상태 및 프로젝트 삭제 ConfirmModal (TASK-02에서 사용)

## Acceptance Criteria

- [ ] 모든 workItems가 단일 테이블 tbody 안에 렌더링됨
- [ ] 프로젝트 컬럼이 첫 번째 컬럼으로 표시됨
- [ ] 프로젝트 첫 번째 행에만 프로젝트명 pill 배지가 나타남
- [ ] 두 번째 이상 행의 프로젝트 셀은 빈 셀(내용 없음)로 표시됨
- [ ] 프로젝트 그룹 마지막 행 하단에 굵은 구분선(`border-b-2`)이 적용됨
- [ ] GridCell 인라인 편집이 정상 동작함
- [ ] 확대 편집(ExpandedEditor) 열기/닫기가 정상 동작함
- [ ] `bun run --filter=frontend build` 성공

## Verify

```bash
cd /c/rnd/weekly-report && bun run --filter=frontend build 2>&1 | tail -20
```

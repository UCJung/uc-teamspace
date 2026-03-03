# WORK-09: 주간업무 그리드 통합 테이블 UI 전환

> Created: 2026-03-02
> Project: 주간업무보고 시스템
> Tech Stack: React 18 + TypeScript, Tailwind CSS, TanStack Table 개념 (커스텀 구현)
> Status: PLANNED
> Tasks: 2

## 개요

주간업무 작성 그리드의 UI 구조를 변경한다.
기존에는 프로젝트별로 독립된 그룹 테이블(헤더 + 하위 table)로 분리되어 있었으나,
하나의 통합 테이블로 표시하되 프로젝트명은 첫 번째 업무 행에만 표시(rowspan 스타일)하고
프로젝트 경계를 구분선으로 시각화한다.

---

## 현재 상태 분석

### 파일 위치
- `packages/frontend/src/components/grid/EditableGrid.tsx` — 핵심 그리드 컴포넌트
- `packages/frontend/src/pages/MyWeeklyReport.tsx` — 그리드를 호출하는 페이지

### 현재 구조 (`EditableGrid.tsx`)

```
workItems → groups (projectId 기준 grouping)
groups.map(group) → {
  <div key=group.projectId 그룹 컨테이너>
    <div 그룹헤더>
      프로젝트명 pill + 코드
      [+ 업무 추가] 버튼
      [✕ 제거] 버튼
    </div>
    <table>
      <thead> # | 진행업무 | 예정업무 | 비고 | (액션) </thead>
      <tbody>
        group.items.map(item) → <tr>
          <td 순번>
          <td GridCell doneWork>
          <td GridCell planWork>
          <td GridCell remarks>
          <td DropdownMenu: 확대편집 | 행 삭제>
        </tr>
      </tbody>
    </table>
  </div>
}
```

컬럼 구성 (현재):
- `index` 4% / `doneWork` 33% / `planWork` 33% / `remarks` 24% / `action` 6%

### MyWeeklyReport.tsx에서의 호출

```tsx
<EditableGrid
  workItems={workItems}
  disabled={isSubmitted}
  onUpdateItem={handleUpdateItem}
  onAddItem={handleAddItem}
  onDeleteItem={handleDeleteItem}
  onDeleteProject={handleDeleteProject}
/>
```

props 인터페이스는 변경 없음 (백엔드/훅 연동 변경 불필요).

---

## 변경 사항 요약

| 항목 | 기존 | 변경 |
|------|------|------|
| 테이블 구조 | 프로젝트별 독립 테이블 N개 | 단일 통합 테이블 1개 |
| 프로젝트명 표시 | 각 테이블 상단 헤더 영역 | 첫 번째 업무 행의 첫 번째 컬럼에만 표시 |
| 컬럼 구성 | `#` / 진행업무 / 예정업무 / 비고 / 액션 | `프로젝트` / 진행업무 / 예정업무 / 비고 / 액션 |
| 업무 추가 버튼 | 그룹 헤더에 별도 버튼 | 각 행의 드롭다운 메뉴 내 "업무 추가" |
| 프로젝트 제거 버튼 | 그룹 헤더에 별도 버튼 | 해당 프로젝트 마지막 행 드롭다운 메뉴 내 "프로젝트 제거" |
| 프로젝트 구분 | 독립 컨테이너 div | 마지막 행 하단 굵은 구분선 (`border-b-2`) |

---

## TASK 목록

| TASK | 제목 | 의존성 | 상태 |
|------|------|--------|------|
| WORK-09-TASK-01 | EditableGrid 통합 테이블 구조 재작성 | 없음 | pending |
| WORK-09-TASK-02 | 행 액션 드롭다운에 업무추가/프로젝트제거 통합 | WORK-09-TASK-01 | pending |

---

## TASK 상세

### WORK-09-TASK-01: EditableGrid 통합 테이블 구조 재작성

**목적**: 프로젝트별 분리 테이블을 단일 통합 테이블로 전환하고,
프로젝트명을 첫 번째 컬럼에 rowspan 스타일로 표시한다.

**수정 대상 파일**:
- `packages/frontend/src/components/grid/EditableGrid.tsx`

**상세 작업 내용**:

1. `COLUMNS` 배열 변경:
   - 기존 `index` 컬럼(4%) 제거
   - 새 `project` 컬럼 추가 (13%)
   - 나머지 컬럼 너비 재조정: project 13% / doneWork 30% / planWork 30% / remarks 20% / action 7%

2. 렌더링 구조 변경:
   - 기존: `groups.map(group => <div><헤더><table>)` → 제거
   - 변경: 단일 `<div className="rounded-lg border overflow-hidden"><table>` 로 감싸기
   - `<thead>`: 단일 헤더 행 (`프로젝트 | 진행업무 | 예정업무 | 비고 | (액션)`)

3. `<tbody>` 행 렌더링:
   - `groups.map(group)` → `group.items.map((item, itemIdx)` 중첩 순회
   - 프로젝트 셀 (`<td>` 첫 번째 컬럼):
     - `itemIdx === 0` 인 경우: 프로젝트명 pill badge 표시 (`var(--primary-bg)` 배경, `var(--primary)` 텍스트)
     - `itemIdx > 0` 인 경우: 빈 셀 (동일 프로젝트임을 시각적으로 표현)
   - 행 스타일:
     - 동일 프로젝트 내부 행들: `border-b border-[var(--gray-border)]`
     - 프로젝트 마지막 행 (`itemIdx === group.items.length - 1`): `border-b-2 border-[var(--gray-border)]` 굵은 하단 구분선
     - 짝수/홀수 줄무늬 대신 프로젝트별 배경색 교체(선택): 단순화를 위해 기존 홀짝 배경 유지 가능
   - 순번 컬럼 제거 (프로젝트 컬럼으로 대체됨)

4. 그룹 헤더 div 완전 제거 (업무추가/제거 버튼 포함)
   → 해당 기능은 TASK-02에서 드롭다운으로 이전

5. 빈 상태 처리:
   - `workItems.length === 0` 안내 메시지 유지

**완료 기준**:
- [ ] 단일 테이블에 모든 업무 행이 표시됨
- [ ] 프로젝트명이 첫 번째 컬럼에 표시되며, 첫 번째 업무 행에만 pill 배지로 렌더링됨
- [ ] 프로젝트 그룹 경계에 굵은 구분선이 적용됨
- [ ] 그룹 헤더 div가 제거됨
- [ ] 기존 GridCell 편집(인라인 편집, 확대 편집) 동작이 유지됨
- [ ] `bun run build` 성공 (프론트엔드)

**Verify**:
```bash
cd /c/rnd/weekly-report && bun run --filter=frontend build 2>&1 | tail -20
```

---

### WORK-09-TASK-02: 행 액션 드롭다운에 업무추가/프로젝트제거 통합

**목적**: 기존 그룹 헤더에 있던 "업무 추가"와 "프로젝트 제거" 기능을
각 행의 액션 드롭다운 메뉴에 통합한다.

**수정 대상 파일**:
- `packages/frontend/src/components/grid/EditableGrid.tsx`

**상세 작업 내용**:

1. 각 행의 `DropdownMenuContent` 항목 변경:
   ```
   [현재]                         [변경 후]
   ↗ 확대 편집                    ↗ 확대 편집
   ─────────────                  + 업무 추가       ← 신규 (onAddItem(item.projectId) 호출)
   ✕ 행 삭제                     ─────────────
                                  ✕ 행 삭제
                                  ─────────────     ← 해당 프로젝트 마지막 행에만 표시
                                  🗑 프로젝트 제거  ← 신규, 마지막 행에만 표시
   ```

2. "업무 추가" 항목:
   - 모든 행에 표시
   - `onSelect={() => onAddItem(item.projectId ?? '')}`
   - 아이콘: `+`, 텍스트: `업무 추가`

3. "프로젝트 제거" 항목:
   - `itemIdx === group.items.length - 1` 인 마지막 행에만 표시
   - `onSelect={() => setDeleteProjectTarget(group)}`
   - 스타일: `text-[var(--danger)]`, danger 색상
   - 기존 `ConfirmModal` (deleteProjectTarget) 그대로 활용

4. `disabled` 조건 처리:
   - `disabled=true` 시 드롭다운 자체를 숨김 (기존 동작 유지)

**완료 기준**:
- [ ] 각 행의 드롭다운 메뉴에 "업무 추가" 항목이 표시됨
- [ ] "업무 추가" 클릭 시 해당 프로젝트에 새 업무 행이 추가됨
- [ ] 프로젝트 마지막 행에만 "프로젝트 제거" 항목이 표시됨
- [ ] "프로젝트 제거" 클릭 시 확인 모달이 열리고 확인 시 해당 프로젝트 업무 전체 삭제
- [ ] 프로젝트의 모든 업무가 삭제되면 테이블에서 해당 프로젝트 행들이 사라짐
- [ ] `bun run build` 성공 (프론트엔드)
- [ ] `bun run lint` 성공 (프론트엔드)

**Verify**:
```bash
cd /c/rnd/weekly-report && bun run --filter=frontend build 2>&1 | tail -20
cd /c/rnd/weekly-report && bun run --filter=frontend lint 2>&1 | tail -20
```

---

## 의존성 DAG

```
WORK-09-TASK-01 (통합 테이블 구조)
        │
        ▼
WORK-09-TASK-02 (액션 드롭다운 통합)
```

TASK-01에서 그룹 헤더를 제거하고 테이블 구조를 확정한 후,
TASK-02에서 드롭다운 메뉴에 업무추가/프로젝트제거를 추가한다.
두 TASK는 동일 파일(`EditableGrid.tsx`)을 수정하므로 순차 진행이 필수이다.

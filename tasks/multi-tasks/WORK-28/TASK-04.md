# WORK-28 TASK-04 — 프론트엔드: MyWeeklyReport 그리드에 작업 연동 버튼 추가

## 목표
주간보고 작성 그리드의 각 WorkItem 행에 연관 작업 수를 표시하는 아이콘 버튼을 추가하고,
클릭 시 팝오버로 PersonalTask 목록을 보여준다.

## 수정 파일

| 파일 | 작업 |
|------|------|
| `packages/frontend/src/components/grid/LinkedTasksPopover.tsx` | 신규 컴포넌트 |
| `packages/frontend/src/components/grid/EditableGrid.tsx` | 행 액션에 작업 연동 버튼 추가 |
| `packages/frontend/src/pages/MyWeeklyReport.tsx` | LinkedTasksPopover 연결 |

## 구현 상세

### LinkedTasksPopover 컴포넌트 (신규)

**Props:**
```typescript
interface LinkedTasksPopoverProps {
  workItemId: string;
  projectId?: string;
  weekLabel: string;
  teamId: string;
  onApplied?: () => void;
}
```

**UI:**
```
[팝오버]
─────────────────────────
 연관 작업 (프로젝트명)
─────────────────────────
 [완료] [진행중] [예정]
─────────────────────────
 □ 작업 제목A
 □ 작업 제목B
─────────────────────────
 [한일에 추가] [할일에 추가]
─────────────────────────
```

**동작:**
- `@radix-ui/react-popover` 또는 커스텀 팝오버 사용
- `useLinkedTasks(workItemId, teamId)` 훅으로 데이터 조회
- `useApplyTasksToWorkItem(currentWeek)` 훅으로 적용
- 적용 성공 시 토스트 알림 + 팝오버 닫기

### EditableGrid 변경

행 액션 영역 (행 오른쪽 끝 또는 행 호버 시 표시)에 아이콘 버튼 추가:
- `CheckSquare` 아이콘 사용
- 연관 작업이 있으면 숫자 배지 표시 (완료 작업 수)
- projectId가 없으면 버튼 비활성화 (회색, 클릭 불가)
- 클릭 시 LinkedTasksPopover 표시

**배지 색상:**
- 완료 작업 있음: `var(--ok)` (초록)
- 진행중 작업만 있음: `var(--accent)` (주황)
- 배지 없음: 기본 아이콘

## 완료 기준
- [ ] 그리드 행마다 작업 연동 아이콘 표시
- [ ] 연관 작업 수 배지 표시
- [ ] 팝오버 클릭으로 작업 목록 조회
- [ ] "한일에 추가" / "할일에 추가" 동작
- [ ] projectId 없는 행은 버튼 비활성화
- [ ] `bun run build` + `bun run lint` 오류 없음

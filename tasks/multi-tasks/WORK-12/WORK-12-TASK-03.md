# WORK-12-TASK-03: 프론트 - 팀업무현황 제거 + 주차 표현 통일

## WORK
WORK-12: 프로젝트/파트 정렬 / 복수 역할 / 팀업무현황 제거 / 주차표현 통일

## Dependencies
없음 (독립적으로 실행 가능)

## Scope

### 1. 팀업무현황(TeamStatus) 제거

제거 대상:
- App.tsx: /team-status 라우트 및 TeamStatus import 삭제
- Sidebar.tsx: MENU_GROUPS 내 "팀 업무 현황" 메뉴 항목 삭제
  현재 위치: "팀 관리" 그룹의 첫 번째 항목 (Sidebar.tsx:60-65)
- TeamStatus.tsx: 파일 자체 삭제

App.tsx 변경:
```typescript
// 삭제
import TeamStatus from './pages/TeamStatus';

// 삭제
<Route path="/team-status" element={
  <RoleGuard roles={['LEADER']}>
    <TeamStatus />
  </RoleGuard>
} />
```

Sidebar.tsx 변경:
```typescript
// 삭제 (MENU_GROUPS 팀 관리 그룹 내)
{
  path: '/team-status',
  label: '팀 업무 현황',
  icon: <Building2 size={14} />,
  roles: ['LEADER'],
},
```

"팀 관리" 그룹이 team-summary만 남게 되므로 그룹 items를 확인하고 정리.

### 2. 주차 표현 통일

공유 유틸 함수 사용:
```typescript
// packages/shared/constants/week-utils.ts 의 formatWeekLabel() 활용
// 반환 형식: "2026년 10주차 (3/2 ~ 3/6)"
import { formatWeekLabel } from '../../packages/shared/constants/week-utils';
// 또는 상대경로
import { formatWeekLabel } from '@weekly-report/shared/constants/week-utils';
```

참고: 프론트에서 shared 패키지 import 방식은 기존 코드 확인 후 동일하게 사용.
실제로는 packages/shared/constants/week-utils.js (컴파일된 JS)를 사용하거나
tsconfig paths 설정에 따라 ts 소스를 직접 참조할 수 있음.

각 페이지별 변경:

**PartStatus.tsx** (301번째 줄):
```typescript
// 변경 전
<span className="...">
  {currentWeek}
</span>

// 변경 후
<span className="...">
  {formatWeekLabel(currentWeek)}
</span>
```

**MyWeeklyReport.tsx**:
- 로컬 formatWeekDisplay() 함수 제거
- shared formatWeekLabel() import 추가
- 사용 부분 교체

**PartSummary.tsx**, **TeamSummary.tsx**, **Dashboard.tsx**, **MyHistory.tsx**:
- 주차 표시 부분 확인
- raw 형식이면 formatWeekLabel() 적용
- 이미 올바른 형식이면 유지 (단, 로컬 함수라면 shared로 교체)

주의사항:
- 각 페이지의 getWeekLabel(), addWeeks() 로컬 함수는 계산용이므로 유지
- 오직 화면에 표시되는 주차 텍스트만 formatWeekLabel() 형식으로 통일
- 주차 선택기의 화살표 버튼 기능은 그대로 유지

## Files

| Path | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/App.tsx` | MODIFY | TeamStatus 라우트/import 제거 |
| `packages/frontend/src/components/layout/Sidebar.tsx` | MODIFY | 팀업무현황 메뉴 항목 제거 |
| `packages/frontend/src/pages/TeamStatus.tsx` | DELETE | 파일 삭제 |
| `packages/frontend/src/pages/MyWeeklyReport.tsx` | MODIFY | formatWeekLabel shared 함수로 교체 |
| `packages/frontend/src/pages/PartStatus.tsx` | MODIFY | formatWeekLabel 적용 |
| `packages/frontend/src/pages/PartSummary.tsx` | MODIFY | formatWeekLabel 적용 (확인 후) |
| `packages/frontend/src/pages/TeamSummary.tsx` | MODIFY | formatWeekLabel 적용 (확인 후) |
| `packages/frontend/src/pages/Dashboard.tsx` | MODIFY | formatWeekLabel 적용 (확인 후) |
| `packages/frontend/src/pages/MyHistory.tsx` | MODIFY | formatWeekLabel 적용 (확인 후) |

## Acceptance Criteria
- [ ] 사이드바에 "팀 업무 현황" 메뉴가 없음 (LEADER 로그인 후 확인)
- [ ] /team-status URL 접근 시 / 로 리다이렉트
- [ ] PartStatus 주차 선택기에서 "2026년 10주차 (3/2 ~ 3/6)" 형식 표시
- [ ] MyWeeklyReport 주차 선택기에서 동일 형식 표시
- [ ] PartSummary, TeamSummary 주차 선택기에서 동일 형식 표시
- [ ] bun run build 성공 (미사용 import/변수 없음)
- [ ] bun run lint 성공

## Verify
```bash
cd /c/rnd/weekly-report/packages/frontend
bun run build
bun run lint
```

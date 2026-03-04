# WORK-18-TASK-24: 헤더 경로 요약 + (?) 헬프 아이콘 → 가이드 연동

> **선행 TASK:** WORK-18-TASK-23
> **목표:** 사용자/관리자 헤더 좌측에 경로별 요약설명, 우측에 (?) 헬프 아이콘으로 해당 메뉴 가이드 연결

## 요청사항
[기능개선] 전체 레이아웃의 상단 헤더 영역 (사용자 관리자 동일)
- 헤더 좌측 : 선택된 경로와 메뉴에 대한 요약설명 표시
- 헤더 우측 : 헬프 아이콘 (?)를 표시하고 선택 시 사용자 가이드의 해당 메뉴 표시
  (연관된 가이드가 없을 경우 가이드 첫번째 화면으로 이동)
  (관리자영역에도 우측 끝에 (?) 헬프 아이콘 표시 기능은 동일)

---

## Step 1 — 계획서

### 1.1 작업 범위

1. **Header.tsx** (사용자):
   - PAGE_TITLES에 누락 경로 추가 (timesheet 3개)
   - 각 경로에 `guideTab` 필드 추가 (가이드 탭 매핑)
   - 우측 "사용가이드" 텍스트 → (?) 원형 아이콘 버튼, 클릭 시 `/guide?tab=XXX`

2. **AdminLayout.tsx** (관리자):
   - 경로별 ADMIN_PAGE_TITLES 매핑 추가
   - 헤더 좌측: 고정 "시스템 관리" → 경로별 동적 제목/설명
   - 헤더 우측: ADMIN 뱃지 유지 + (?) 아이콘 버튼 추가 → `/guide?tab=admin`

3. **UserGuide.tsx**:
   - URL 쿼리 파라미터 `?tab=XXX` 지원 (useSearchParams)
   - 초기 activeTab을 쿼리에서 읽어 설정

### 경로 → 가이드 탭 매핑

| 경로 | 가이드 탭 |
|------|-----------|
| `/` (대시보드) | `start` |
| `/my-weekly` | `member` |
| `/timesheet` | `member` |
| `/part-status` | `part-leader` |
| `/report-consolidation` | `part-leader` |
| `/team-mgmt` | `leader` |
| `/project-mgmt` | `leader` |
| `/timesheet/team-review` | `leader` |
| `/timesheet/project-allocation` | `leader` |
| `/admin/*` | `admin` |

---

## Step 2 — 체크리스트

- [ ] Header.tsx: PAGE_TITLES 누락 경로 + guideTab 매핑 추가
- [ ] Header.tsx: 우측 (?) 아이콘 버튼 → /guide?tab=XXX 네비게이션
- [ ] AdminLayout.tsx: ADMIN_PAGE_TITLES 동적 매핑
- [ ] AdminLayout.tsx: 우측 (?) 아이콘 버튼 추가
- [ ] UserGuide.tsx: ?tab= 쿼리 파라미터 지원
- [ ] `bun run build` — 0 에러
- [ ] `bun run lint` — 0 에러

---

## Step 3 — 검증 명령

```bash
bun run build
bun run lint
```

# WORK-18-TASK-12: 전체화면 모드 + 합계열 이동 + 고정 헤더/푸터 스크롤

> 의존성: TASK-11 (완료)
> 우선순위: 보통

---

## Step 1. 계획

### 1.1 전체화면 모드
- 테이블 영역만 전체화면으로 표시하는 버튼 추가
- `position: fixed; inset: 0; z-index: 9999` 오버레이로 렌더링
- 전체화면 진입/해제 버튼 (Maximize2/Minimize2 아이콘)

### 1.2 합계열 이동
- 합계열을 프로젝트 열 뒤에서 근태열 바로 우측으로 이동

### 1.3 고정 헤더/푸터 + tbody 스크롤
- thead, tfoot은 고정, tbody 영역만 스크롤
- 테이블을 3개 `<table>` 요소로 분리 (헤더, 바디, 푸터)
- 화면 전체 스크롤 없이 컨텐츠 영역에 꽉 차게 표시

---

## Step 2. 체크리스트

### 2.1 전체화면 모드
- [ ] `fullscreen` state 추가
- [ ] Maximize2, Minimize2 아이콘 import
- [ ] 전체화면 토글 버튼 추가
- [ ] `renderGridPanel(isFull)` — 공유 테이블 렌더링 함수
- [ ] fullscreen: `position: fixed; inset: 0; z-index: 9999` 오버레이

### 2.2 합계열 이동
- [ ] 헤더에서 합계열을 근태 다음(4번째)으로 이동
- [ ] 바디에서 합계 셀을 근태 다음으로 이동
- [ ] 푸터에서 합계 셀을 근태 다음으로 이동

### 2.3 고정 헤더/푸터 + tbody 스크롤
- [ ] `renderHeadRow()` 헬퍼 함수 추출
- [ ] `renderBodyRows()` 헬퍼 함수 추출
- [ ] `renderFootRow()` 헬퍼 함수 추출
- [ ] 테이블 3분할: thead table + scrollable tbody div + tfoot table
- [ ] flex 레이아웃으로 tbody 영역만 스크롤

### 2.4 통합 검증
- [ ] `bun run build` — 0 에러
- [ ] `bun run lint` — 0 에러

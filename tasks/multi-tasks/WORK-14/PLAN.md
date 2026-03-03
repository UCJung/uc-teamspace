# WORK-14: UI 기능 테스트 수정사항 (Require-03)

> Created: 2026-03-02
> Project: 주간업무보고 시스템
> Requirement: tasks/Require/Require-03.md
> Status: PLANNED
> Tasks: 4

## 개요

UI 기능 테스트 결과 발견된 8가지 수정사항을 반영한다.

## 요구사항 분석

| # | 요구사항 | 영역 | 현재 상태 | 변경 내용 |
|---|----------|------|-----------|-----------|
| R1 | 목록 입력박스 높이 동적 조정 | 프론트(GridCell) | textarea min-h 60px 고정, autoResize는 있지만 최초 진입 시 미적용 | 편집 모드 진입 시 즉시 autoResize 호출하여 내용에 맞게 높이 조정 |
| R2 | 세부내용 기호 변경 `ㄴ` → `-` | 프론트(FormattedText) | `ㄴ` 문자로 파싱·렌더링 | 파싱: `ㄴ`와 `-` 둘 다 detail로 인식, 렌더링: `-`로 표시 |
| R3 | 셀확대편집창 화면 하단 고정 오버레이 | 프론트(ExpandedEditor) | 인라인(행 아래) 렌더링 | `fixed bottom-0` 오버레이로 변경, 목록 위에 표시 |
| R4 | 전주불러오기: 진행/예정/비고 그대로 복사 | 백엔드(carry-forward) | planWork → doneWork 변환, planWork·remarks 빈값 | doneWork·planWork·remarks 원본 그대로 복사 |
| R5 | 내 주간보고 목록 정렬: 프로젝트 정렬순서 | 프론트(MyWeeklyReport) / 백엔드 | workItems.sortOrder 기준 | project.sortOrder 기준으로 정렬 |
| R6 | 보고서취합: 제출 후 엑셀 다운로드 | 프론트(ReportConsolidation) | 엑셀 다운로드 버튼 없음 | 제출 상태일 때 Excel 다운로드 버튼 추가 |
| R7 | 대시보드: 주차 선택 기능 | 프론트(Dashboard) | 현재 주차 고정, 변경 불가 | ◀ ▶ 주차 네비게이션 추가 |
| R8 | 파트취합현황 → 보고서 취합 현황으로 변경, 제출 시 보기 이동 | 프론트(PartStatus/Dashboard) | "파트 취합 현황" 고정 라벨, 이동 없음 | 라벨 변경 + 제출된 보고서 클릭 시 /report-consolidation 이동 |

## TASK 목록

| ID | 제목 | 요구사항 | 의존 |
|----|------|----------|------|
| WORK-14-TASK-00 | 백엔드: 전주불러오기 + 정렬 수정 | R4, R5 | 없음 |
| WORK-14-TASK-01 | 프론트: GridCell 높이 + FormattedText 기호 + ExpandedEditor 오버레이 | R1, R2, R3 | 없음 |
| WORK-14-TASK-02 | 프론트: 대시보드 주차선택 + 취합현황 변경 + 엑셀다운로드 | R6, R7, R8 | 없음 |
| WORK-14-TASK-03 | 프론트: 내 주간보고 정렬 + 전주불러오기 UI 반영 | R4, R5 | TASK-00 |

## 의존성 DAG

```
WORK-14-TASK-00 (백엔드)  ──> WORK-14-TASK-03 (내 주간보고 프론트)
WORK-14-TASK-01 (그리드 컴포넌트) ─ 독립
WORK-14-TASK-02 (대시보드/취합현황) ─ 독립
```

TASK-00, TASK-01, TASK-02는 병렬 실행 가능. TASK-03은 TASK-00 완료 후 실행.

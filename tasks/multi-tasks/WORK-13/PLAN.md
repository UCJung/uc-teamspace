# WORK-13: 보고서 취합 기능 재설계

> Created: 2026-03-02
> Project: 주간업무보고 시스템
> Tech Stack: NestJS 11 / Prisma 6 / React 18 / Tailwind CSS / TypeScript
> Status: PLANNED
> Tasks: 3

## 개요

현재 파트 단위 자동 취합(프로젝트별 병합)만 존재하는 시스템을 **팀장/파트장이 전체 또는 파트 단위로 개별 행을 보면서 수동 병합/수정/삭제**할 수 있도록 재설계한다.

핵심 변경:
1. 취합 범위 선택: 전체(팀) / 파트 선택
2. 개별 행 로딩 (팀원별 WorkItem 각각 1행으로 표시)
3. 수동 행 병합, 편집, 삭제 기능
4. 원 작성자 보고서에 영향 없음 (SummaryWorkItem만 수정)
5. 제출 후 수정 불가

## 현재 상태 분석

### 기존 PartSummary 시스템
- `PartSummary` 모델: partId + weekStart unique, DRAFT/SUBMITTED
- `SummaryWorkItem` 모델: partSummaryId, projectId, doneWork/planWork/remarks
- `autoMerge()`: 프로젝트 단위로 모든 팀원 업무를 자동 병합 (1프로젝트=1행)
- 프론트: `PartSummary.tsx` (파트장 편집), `TeamSummary.tsx` (팀장 조회)

### 부족한 점
- 팀 전체 취합 불가 (파트 단위만)
- 개별 행 확인 불가 (자동 병합으로 원본 구분 안됨)
- 수동 행 선택 병합 없음
- 팀원 이름 추적 없음

## 변경 사항 요약

| 영역 | 변경 내용 |
|------|-----------|
| DB (Prisma) | PartSummary에 scope/teamId/title 추가, SummaryWorkItem에 memberNames 추가 |
| 백엔드 | loadMemberRows, mergeRows, updateWorkItem, deleteWorkItem 신규 + summaries 엔드포인트 |
| 프론트엔드 | ReportConsolidation.tsx 신규 (PartSummary+TeamSummary 통합 대체), 라우터/사이드바 변경 |

## TASK 목록

| ID | 제목 | 의존 |
|----|------|------|
| WORK-13-TASK-00 | DB 스키마 변경 + 마이그레이션 | 없음 |
| WORK-13-TASK-01 | 백엔드 API (서비스 + 컨트롤러 + DTO) | TASK-00 |
| WORK-13-TASK-02 | 프론트엔드 페이지 + API + 라우터/사이드바 | TASK-01 |

## 의존성 DAG

```
WORK-13-TASK-00 (DB 마이그레이션)
    └──> WORK-13-TASK-01 (백엔드 API)
              └──> WORK-13-TASK-02 (프론트엔드)
```

순차 실행 (각 단계가 이전 단계에 의존)

/**
 * 공통 라벨/배리언트 상수
 * 여러 페이지에서 공유하는 역할명, 상태명, 배지 배리언트를 한 곳에서 관리한다.
 */

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: '관리자',
  LEADER: '팀장',
  PART_LEADER: '파트장',
  MEMBER: '팀원',
};

export const REPORT_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: '제출완료',
  DRAFT: '임시저장',
  NOT_STARTED: '미작성',
};

export const REPORT_STATUS_VARIANT: Record<string, 'ok' | 'warn' | 'danger' | 'gray'> = {
  SUBMITTED: 'ok',
  DRAFT: 'warn',
  NOT_STARTED: 'gray',
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
};

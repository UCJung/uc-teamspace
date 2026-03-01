import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const PAGE_TITLES: Record<string, string> = {
  '/': '대시보드',
  '/my-weekly': '주간업무 작성',
  '/my-history': '업무 이력',
  '/part-status': '파트 업무 현황',
  '/part-summary': '파트 취합보고',
  '/team-status': '팀 업무 현황',
  '/team-mgmt': '팀·파트·팀원 관리',
  '/project-mgmt': '프로젝트 관리',
};

const ROLE_LABELS: Record<string, string> = {
  LEADER: '팀장',
  PART_LEADER: '파트장',
  MEMBER: '팀원',
};

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] ?? '주간업무보고';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="fixed top-0 right-0 bg-white border-b border-[var(--gray-border)] flex items-center justify-between px-5 z-20"
      style={{ height: 'var(--header-h)', left: 'var(--sidebar-w)' }}
    >
      <h1 className="text-[14px] font-semibold text-[var(--text)]">{title}</h1>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-sub)]">{user.partName}</span>
            <span className="text-[12px] font-medium text-[var(--text)]">{user.name}</span>
            <span className="text-[11px] text-[var(--primary)] bg-[var(--primary-bg)] px-1.5 py-0.5 rounded">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-[11px] text-[var(--text-sub)] hover:text-[var(--danger)] transition-colors"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}

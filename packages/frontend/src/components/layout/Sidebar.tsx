import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface MenuItem {
  path: string;
  label: string;
  roles?: string[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    title: '대시보드',
    items: [{ path: '/', label: '홈' }],
  },
  {
    title: '내 업무',
    items: [
      { path: '/my-weekly', label: '주간업무 작성' },
      { path: '/my-history', label: '업무 이력' },
    ],
  },
  {
    title: '파트 관리',
    items: [
      {
        path: '/part-status',
        label: '파트 업무 현황',
        roles: ['LEADER', 'PART_LEADER'],
      },
      {
        path: '/part-summary',
        label: '파트 취합보고',
        roles: ['PART_LEADER'],
      },
    ],
  },
  {
    title: '팀 관리',
    items: [
      {
        path: '/team-status',
        label: '팀 업무 현황',
        roles: ['LEADER'],
      },
    ],
  },
  {
    title: '시스템 관리',
    items: [
      {
        path: '/team-mgmt',
        label: '팀·파트·팀원 관리',
        roles: ['LEADER'],
      },
      {
        path: '/project-mgmt',
        label: '프로젝트 관리',
        roles: ['LEADER'],
      },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const canAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <aside
      style={{ width: 'var(--sidebar-w)', backgroundColor: 'var(--sidebar-bg)' }}
      className="fixed top-0 left-0 h-full flex flex-col z-30"
    >
      {/* 로고 */}
      <div
        className="flex items-center px-5 border-b border-white/10 cursor-pointer"
        style={{ height: 'var(--header-h)' }}
        onClick={() => navigate('/')}
      >
        <span className="text-white font-bold text-[13px]">주간업무보고</span>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 overflow-y-auto py-3">
        {MENU_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-1">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-5 py-2">
                {group.title}
              </p>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    [
                      'flex items-center h-9 px-5 text-[12px] transition-colors',
                      isActive
                        ? 'bg-[#252D48] text-white border-l-2 border-[var(--primary)]'
                        : 'text-white/70 hover:text-white hover:bg-white/5',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

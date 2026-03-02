import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { useMyTeams } from '../../hooks/useTeams';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const { currentTeamId, setCurrentTeamId, setMyTeams } = useTeamStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: myTeams, isSuccess } = useMyTeams();

  // 소속팀 목록 로드 후 팀 선택 로직 처리
  useEffect(() => {
    if (!isSuccess || !myTeams) return;

    // 팀 목록을 store에 동기화
    setMyTeams(myTeams);

    // /teams 페이지는 리다이렉트 제외
    if (location.pathname === '/teams') return;

    if (myTeams.length === 0) {
      // 소속팀 없음 → TeamLanding으로
      navigate('/teams', { replace: true });
    } else if (myTeams.length === 1) {
      // 소속팀 1개 → 자동 선택
      if (!currentTeamId || !myTeams.find((t) => t.id === currentTeamId)) {
        setCurrentTeamId(myTeams[0].id);
      }
    } else {
      // 소속팀 2개 이상 → currentTeamId 없으면 TeamLanding으로
      if (!currentTeamId || !myTeams.find((t) => t.id === currentTeamId)) {
        navigate('/teams', { replace: true });
      }
    }
  }, [isSuccess, myTeams, currentTeamId, setCurrentTeamId, setMyTeams, navigate, location.pathname]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden w-full" style={{ backgroundColor: 'var(--gray-light)' }}>
      {/* 사이드바: 고정 너비 */}
      <Sidebar />

      {/* 우측 영역: Header + 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

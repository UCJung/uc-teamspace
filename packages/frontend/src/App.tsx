import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyWeeklyReport from './pages/MyWeeklyReport';
import MyHistory from './pages/MyHistory';
import PartStatus from './pages/PartStatus';
import PartSummary from './pages/PartSummary';
import TeamStatus from './pages/TeamStatus';
import TeamMgmt from './pages/TeamMgmt';
import ProjectMgmt from './pages/ProjectMgmt';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 로그인 */}
          <Route path="/login" element={<Login />} />

          {/* 인증 필요 라우트 */}
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/my-weekly" element={<MyWeeklyReport />} />
            <Route path="/my-history" element={<MyHistory />} />
            <Route
              path="/part-status"
              element={
                <RoleGuard roles={['LEADER', 'PART_LEADER']}>
                  <PartStatus />
                </RoleGuard>
              }
            />
            <Route
              path="/part-summary"
              element={
                <RoleGuard roles={['PART_LEADER']}>
                  <PartSummary />
                </RoleGuard>
              }
            />
            <Route
              path="/team-status"
              element={
                <RoleGuard roles={['LEADER']}>
                  <TeamStatus />
                </RoleGuard>
              }
            />
            <Route
              path="/team-mgmt"
              element={
                <RoleGuard roles={['LEADER']}>
                  <TeamMgmt />
                </RoleGuard>
              }
            />
            <Route
              path="/project-mgmt"
              element={
                <RoleGuard roles={['LEADER']}>
                  <ProjectMgmt />
                </RoleGuard>
              }
            />
          </Route>

          {/* 404 처리 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

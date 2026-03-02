import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../ui/Toast';
import { useAuthStore } from '../../stores/authStore';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();

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

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
    <div className="min-h-screen bg-[var(--gray-light)]">
      <Sidebar />
      <Header />
      <main
        className="min-h-screen"
        style={{
          marginLeft: 'var(--sidebar-w)',
          paddingTop: 'var(--header-h)',
          padding: `calc(var(--header-h) + 18px) 20px 18px`,
          paddingLeft: `calc(var(--sidebar-w) + 20px)`,
        }}
      >
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

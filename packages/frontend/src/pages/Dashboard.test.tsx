import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// mock axios
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { data: {} } }),
    patch: vi.fn().mockResolvedValue({ data: { data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { data: {} } }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('../stores/uiStore', () => ({
  useUiStore: () => ({ addToast: vi.fn(), toasts: [] }),
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
};

// MEMBER 역할 대시보드 테스트
vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', name: '홍길동', role: 'MEMBER', partId: 'p1', partName: 'DX' },
    isAuthenticated: () => true,
  }),
}));

import Dashboard from './Dashboard';

describe('Dashboard (MEMBER)', () => {
  test('renders welcome message', () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getByText('홍길동')).toBeDefined();
  });

  test('renders summary cards', () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getAllByText('이번 주').length).toBeGreaterThan(0);
    expect(screen.getByText('소속 파트')).toBeDefined();
  });

  test('renders quick link for MEMBER role', () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getByText('내 주간업무 작성하기')).toBeDefined();
  });

  test('renders recent 4 weeks section', () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getByText('최근 4주')).toBeDefined();
  });

  test('renders this week label', () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getAllByText('이번 주').length).toBeGreaterThan(0);
  });
});

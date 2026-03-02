import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// api/client, stores/uiStore mock은 setup.ts에서 공통 처리

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', name: '홍길동', role: 'LEADER', partId: 'p1', partName: 'DX' },
    isAuthenticated: () => true,
  }),
}));

import ProjectMgmt from './ProjectMgmt';

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

describe('ProjectMgmt', () => {
  test('renders table headers', () => {
    render(<ProjectMgmt />, { wrapper: createWrapper() });
    expect(screen.getByText('프로젝트명')).toBeDefined();
    expect(screen.getByText('코드')).toBeDefined();
    expect(screen.getByText('분류')).toBeDefined();
    expect(screen.getByText('상태')).toBeDefined();
    expect(screen.getByText('참여인원')).toBeDefined();
  });

  test('renders summary cards', () => {
    render(<ProjectMgmt />, { wrapper: createWrapper() });
    expect(screen.getByText('전체 프로젝트')).toBeDefined();
    expect(screen.getByText('공통 과제')).toBeDefined();
    expect(screen.getByText('수행 과제')).toBeDefined();
    expect(screen.getByText('활성 프로젝트')).toBeDefined();
  });

  test('renders register button', () => {
    render(<ProjectMgmt />, { wrapper: createWrapper() });
    expect(screen.getByText('+ 프로젝트 등록')).toBeDefined();
  });
});

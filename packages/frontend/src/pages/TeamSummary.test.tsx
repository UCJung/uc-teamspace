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

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'u1',
      name: '정우철',
      role: 'LEADER',
      partId: 'p1',
      partName: 'DX',
      teamId: 't1',
    },
    isAuthenticated: () => true,
  }),
}));

vi.mock('../stores/uiStore', () => ({
  useUiStore: () => ({ addToast: vi.fn(), toasts: [] }),
}));

import TeamSummary from './TeamSummary';

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

describe('TeamSummary', () => {
  test('renders week navigator', () => {
    render(<TeamSummary />, { wrapper: createWrapper() });
    expect(screen.getByText('◀')).toBeDefined();
    expect(screen.getByText('▶')).toBeDefined();
  });

  test('renders summary cards', () => {
    render(<TeamSummary />, { wrapper: createWrapper() });
    expect(screen.getByText('제출 완료')).toBeDefined();
    expect(screen.getByText('작성 중 (임시저장)')).toBeDefined();
    expect(screen.getByText('미작성')).toBeDefined();
  });

  test('renders table headers', () => {
    render(<TeamSummary />, { wrapper: createWrapper() });
    expect(screen.getByText('파트')).toBeDefined();
    expect(screen.getByText('파트장')).toBeDefined();
    expect(screen.getByText('제출 상태')).toBeDefined();
    expect(screen.getByText('업무항목 수')).toBeDefined();
    expect(screen.getByText('제출 일시')).toBeDefined();
    expect(screen.getByText('조회')).toBeDefined();
  });

  test('renders excel export button', () => {
    render(<TeamSummary />, { wrapper: createWrapper() });
    expect(screen.getByText('Excel 내보내기')).toBeDefined();
  });

  test('renders 취합보고서 목록 title', () => {
    render(<TeamSummary />, { wrapper: createWrapper() });
    expect(screen.getByText('취합보고서 목록')).toBeDefined();
  });

  test('renders table body (loading or empty state)', () => {
    render(<TeamSummary />, { wrapper: createWrapper() });
    // Either loading or empty message should be present in the table
    const loadingOrEmpty =
      screen.queryByText('로딩 중...') ?? screen.queryByText('취합보고서 데이터가 없습니다.');
    expect(loadingOrEmpty).not.toBeNull();
  });
});

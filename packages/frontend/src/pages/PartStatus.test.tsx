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
    user: { id: 'u1', name: '문선홍', role: 'PART_LEADER', partId: 'p1', partName: 'DX' },
    isAuthenticated: () => true,
  }),
}));

vi.mock('../stores/uiStore', () => ({
  useUiStore: () => ({ addToast: vi.fn(), toasts: [] }),
}));

import PartStatus from './PartStatus';

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

describe('PartStatus', () => {
  test('renders week navigator', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    // 주차 이동 버튼 확인
    expect(screen.getByText('◀')).toBeDefined();
    expect(screen.getByText('▶')).toBeDefined();
  });

  test('renders table headers', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('성명')).toBeDefined();
    expect(screen.getByText('프로젝트')).toBeDefined();
    expect(screen.getByText(/진행업무/)).toBeDefined();
    expect(screen.getByText(/예정업무/)).toBeDefined();
  });

  test('renders excel export button', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('Excel 내보내기')).toBeDefined();
  });

  test('renders submission status section', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('파트원 작성 현황')).toBeDefined();
  });

  test('shows empty message when no members', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('파트원이 없습니다.')).toBeDefined();
  });

  test('renders filter section with 필터 label', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('필터')).toBeDefined();
  });
});

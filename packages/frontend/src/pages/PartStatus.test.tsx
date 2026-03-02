import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// api/client, stores/uiStore mock은 setup.ts에서 공통 처리

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', name: '최수진', roles: ['PART_LEADER'], partId: 'p1', partName: 'DX', teamId: 't1' },
    isAuthenticated: () => true,
  }),
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
    expect(screen.getByText('◀')).toBeDefined();
    expect(screen.getByText('▶')).toBeDefined();
  });

  test('renders table headers', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    const projectElements = screen.getAllByText('프로젝트');
    expect(projectElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('팀원')).toBeDefined();
    expect(screen.getByText(/진행업무/)).toBeDefined();
    expect(screen.getByText(/예정업무/)).toBeDefined();
  });

  test('renders filter section', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('인원')).toBeDefined();
  });

  test('renders view mode toggle', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('프로젝트별')).toBeDefined();
    expect(screen.getByText('팀원별')).toBeDefined();
  });

  test('shows part name for non-leader user', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('DX')).toBeDefined();
  });

  test('renders task status section title', () => {
    render(<PartStatus />, { wrapper: createWrapper() });
    expect(screen.getByText('업무현황')).toBeDefined();
  });
});

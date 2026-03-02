import { vi } from 'vitest';

// 공통 axios client mock - 모든 테스트에서 재사용
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

// 공통 uiStore mock
vi.mock('../stores/uiStore', () => ({
  useUiStore: () => ({ addToast: vi.fn(), toasts: [] }),
}));

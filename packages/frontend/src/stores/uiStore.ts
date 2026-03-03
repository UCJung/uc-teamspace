import { create } from 'zustand';

type ToastType = 'success' | 'warning' | 'info' | 'danger';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface UiState {
  sidebarCollapsed: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toasts: [],

  toggleSidebar: () =>
    set((state: UiState) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  addToast: (type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state: UiState) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    // 3초 후 자동 제거
    setTimeout(() => {
      set((state: UiState) => ({
        toasts: state.toasts.filter((t: Toast) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id: string) =>
    set((state: UiState) => ({
      toasts: state.toasts.filter((t: Toast) => t.id !== id),
    })),
}));

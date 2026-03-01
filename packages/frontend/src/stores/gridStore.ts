import { create } from 'zustand';

interface FocusedCell {
  rowIndex: number;
  columnId: string;
}

interface DirtyEntry {
  projectId?: string;
  doneWork?: string;
  planWork?: string;
  remarks?: string;
}

interface GridState {
  focusedCell: FocusedCell | null;
  editingValue: string | null;
  dirtyMap: Map<string, DirtyEntry>;
  isSaving: boolean;

  setFocusedCell: (cell: FocusedCell | null) => void;
  setEditingValue: (value: string | null) => void;
  markDirty: (workItemId: string, changes: DirtyEntry) => void;
  markClean: (workItemId: string) => void;
  setIsSaving: (saving: boolean) => void;
}

export const useGridStore = create<GridState>((set) => ({
  focusedCell: null,
  editingValue: null,
  dirtyMap: new Map(),
  isSaving: false,

  setFocusedCell: (cell) => set({ focusedCell: cell }),
  setEditingValue: (value) => set({ editingValue: value }),

  markDirty: (workItemId, changes) =>
    set((state) => {
      const next = new Map(state.dirtyMap);
      const existing = next.get(workItemId) ?? {};
      next.set(workItemId, { ...existing, ...changes });
      return { dirtyMap: next };
    }),

  markClean: (workItemId) =>
    set((state) => {
      const next = new Map(state.dirtyMap);
      next.delete(workItemId);
      return { dirtyMap: next };
    }),

  setIsSaving: (saving) => set({ isSaving: saving }),
}));

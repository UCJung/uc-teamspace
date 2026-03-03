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

  setFocusedCell: (cell: FocusedCell | null) => set({ focusedCell: cell }),
  setEditingValue: (value: string | null) => set({ editingValue: value }),

  markDirty: (workItemId: string, changes: DirtyEntry) =>
    set((state: GridState) => {
      const next = new Map(state.dirtyMap);
      const existing = next.get(workItemId) ?? {};
      next.set(workItemId, { ...existing, ...changes });
      return { dirtyMap: next };
    }),

  markClean: (workItemId: string) =>
    set((state: GridState) => {
      const next = new Map(state.dirtyMap);
      next.delete(workItemId);
      return { dirtyMap: next };
    }),

  setIsSaving: (saving: boolean) => set({ isSaving: saving }),
}));

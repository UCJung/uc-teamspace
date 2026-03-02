import React, { useState, useCallback, useRef } from 'react';
import GridCell from './GridCell';
import ProjectDropdown from './ProjectDropdown';
import ExpandedEditor from './ExpandedEditor';
import { WorkItem } from '../../api/weekly-report.api';
import { Project } from '../../api/project.api';
import { useGridStore } from '../../stores/gridStore';
import { ConfirmModal } from '../ui/Modal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';

interface EditableGridProps {
  workItems: WorkItem[];
  disabled?: boolean;
  onUpdateItem: (id: string, data: Partial<Pick<WorkItem, 'projectId' | 'doneWork' | 'planWork' | 'remarks'>>) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
}

type EditingCell = { rowId: string; column: 'doneWork' | 'planWork' | 'remarks' } | null;

// 컬럼 너비: 14% / 7% / 28% / 28% / 17% / 6%
const COLUMNS = [
  { id: 'project',  label: '프로젝트명',          width: '14%' },
  { id: 'code',     label: '프로젝트코드',          width: '7%' },
  { id: 'doneWork', label: '진행업무 (한일)',       width: '28%' },
  { id: 'planWork', label: '예정업무 (할일)',       width: '28%' },
  { id: 'remarks',  label: '비고 및 이슈',          width: '17%' },
  { id: 'action',   label: '',                     width: '6%' },
];

export default function EditableGrid({
  workItems,
  disabled = false,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
}: EditableGridProps) {
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [projectDropdownRow, setProjectDropdownRow] = useState<string | null>(null);
  const [expandedCell, setExpandedCell] = useState<EditingCell>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { markDirty } = useGridStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const startEdit = useCallback((rowId: string, column: 'doneWork' | 'planWork' | 'remarks') => {
    if (disabled) return;
    setEditingCell({ rowId, column });
  }, [disabled]);

  const endEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleSave = useCallback(
    (id: string, column: 'doneWork' | 'planWork' | 'remarks', value: string) => {
      const item = workItems.find((w) => w.id === id);
      if (item && item[column] === value) return;
      markDirty(id, { [column]: value });
      onUpdateItem(id, { [column]: value });
    },
    [workItems, markDirty, onUpdateItem],
  );

  const handleProjectSelect = useCallback(
    (rowId: string, project: Project) => {
      markDirty(rowId, { projectId: project.id });
      onUpdateItem(rowId, { projectId: project.id });
      setProjectDropdownRow(null);
    },
    [markDirty, onUpdateItem],
  );

  return (
    <div>
      <div className="overflow-auto rounded-lg border border-[var(--gray-border)]">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: 'fixed' }}
        >
          <colgroup>
            {COLUMNS.map((col) => (
              <col key={col.id} style={{ width: col.width }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--tbl-header)]">
              {COLUMNS.map((col) => (
                <th
                  key={col.id}
                  className="text-left px-3 py-[9px] text-[11.5px] font-semibold text-[var(--text-sub)] border-b border-[var(--gray-border)] whitespace-nowrap tracking-wide uppercase"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workItems.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[var(--text-sub)] text-[12.5px]">
                  업무항목이 없습니다. 아래 [+ 행 추가] 버튼을 눌러 추가하세요.
                </td>
              </tr>
            )}
            {workItems.map((item, idx) => (
              <tr
                key={item.id}
                className={[
                  'border-b border-[var(--gray-border)]',
                  idx % 2 === 0 ? 'bg-[var(--row-alt)]' : 'bg-white',
                  'hover:bg-[var(--primary-bg)]/20 transition-colors',
                ].join(' ')}
              >
                {/* 프로젝트명 — pill 스타일 + ▼ 인디케이터 */}
                <td className="px-3 py-[8px] align-top text-[12.5px]">
                  <div className="relative">
                    <button
                      disabled={disabled}
                      className={[
                        'w-full text-left min-h-[52px] rounded transition-colors',
                        !disabled ? 'hover:bg-[var(--primary-bg)] cursor-pointer' : 'cursor-default',
                      ].join(' ')}
                      onClick={() => !disabled && setProjectDropdownRow(item.id)}
                    >
                      {item.project ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium"
                          style={{
                            backgroundColor: 'var(--primary-bg)',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            opacity: 1,
                          }}
                        >
                          {item.project.name}
                          {!disabled && (
                            <span className="text-[9px] opacity-60">▼</span>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 text-[11.5px] text-[var(--text-sub)] italic">
                          + 프로젝트 선택
                          {!disabled && (
                            <span className="text-[9px] opacity-50">▼</span>
                          )}
                        </span>
                      )}
                    </button>
                    {projectDropdownRow === item.id && (
                      <div ref={dropdownRef}>
                        <ProjectDropdown
                          value={item.projectId}
                          onChange={(project) => handleProjectSelect(item.id, project)}
                          onClose={() => setProjectDropdownRow(null)}
                        />
                      </div>
                    )}
                  </div>
                </td>

                {/* 프로젝트 코드 */}
                <td
                  className="px-3 py-[8px] align-top text-[12.5px]"
                  style={{ backgroundColor: 'var(--tbl-header)' }}
                >
                  <div className="px-1 py-1 min-h-[52px] text-[10.5px] font-mono text-[var(--text-sub)] tracking-widest">
                    {item.project?.code ?? ''}
                  </div>
                </td>

                {/* 진행업무 */}
                <td className="px-3 py-[8px] align-top text-[12.5px]">
                  <GridCell
                    value={item.doneWork}
                    isEditing={editingCell?.rowId === item.id && editingCell?.column === 'doneWork'}
                    onStartEdit={() => startEdit(item.id, 'doneWork')}
                    onEndEdit={endEdit}
                    onSave={(v) => handleSave(item.id, 'doneWork', v)}
                    disabled={disabled}
                    placeholder="진행업무 입력"
                    onOpenExpanded={() => setExpandedCell({ rowId: item.id, column: 'doneWork' })}
                  />
                </td>

                {/* 예정업무 */}
                <td className="px-3 py-[8px] align-top text-[12.5px]">
                  <GridCell
                    value={item.planWork}
                    isEditing={editingCell?.rowId === item.id && editingCell?.column === 'planWork'}
                    onStartEdit={() => startEdit(item.id, 'planWork')}
                    onEndEdit={endEdit}
                    onSave={(v) => handleSave(item.id, 'planWork', v)}
                    disabled={disabled}
                    placeholder="예정업무 입력"
                    onOpenExpanded={() => setExpandedCell({ rowId: item.id, column: 'planWork' })}
                  />
                </td>

                {/* 비고 */}
                <td className="px-3 py-[8px] align-top text-[12.5px]">
                  <GridCell
                    value={item.remarks ?? ''}
                    isEditing={editingCell?.rowId === item.id && editingCell?.column === 'remarks'}
                    onStartEdit={() => startEdit(item.id, 'remarks')}
                    onEndEdit={endEdit}
                    onSave={(v) => handleSave(item.id, 'remarks', v)}
                    disabled={disabled}
                    placeholder="비고"
                  />
                </td>

                {/* 액션 — 케밥 메뉴 (⋮) */}
                <td className="px-2 py-[8px] align-top text-center">
                  {!disabled && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="mt-1.5 w-[26px] h-[26px] flex items-center justify-center rounded text-[var(--text-sub)] hover:bg-[var(--gray-light)] hover:text-[var(--text)] transition-colors text-[16px] leading-none"
                          title="행 옵션"
                          aria-label="행 옵션 메뉴"
                        >
                          ⋮
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            const col: 'doneWork' | 'planWork' | 'remarks' =
                              editingCell?.rowId === item.id
                                ? (editingCell.column)
                                : 'doneWork';
                            setExpandedCell({ rowId: item.id, column: col });
                          }}
                        >
                          <span className="mr-1.5">↗</span>
                          확대 편집
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => setDeleteTarget(item.id)}
                          className="text-[var(--danger)] hover:bg-[var(--danger-bg)] focus:bg-[var(--danger-bg)]"
                        >
                          <span className="mr-1.5">✕</span>
                          행 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}

            {/* dashed 추가 행 */}
            {!disabled && (
              <tr
                className="cursor-pointer hover:bg-[var(--primary-bg)]/30 transition-colors"
                onClick={onAddItem}
              >
                <td
                  colSpan={6}
                  className="px-4 py-3 text-center text-[12px] text-[var(--text-sub)] italic"
                  style={{
                    border: '2px dashed var(--gray-border)',
                    borderTop: 'none',
                  }}
                >
                  <span className="hover:text-[var(--primary)] transition-colors">
                    + 프로젝트 선택 / 행 추가
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 확대 편집 패널 */}
      {expandedCell && (() => {
        const item = workItems.find((w) => w.id === expandedCell.rowId);
        if (!item) return null;
        const columnLabels: Record<string, string> = {
          doneWork: '진행업무 (한일)',
          planWork: '예정업무 (할일)',
          remarks: '비고 및 이슈',
        };
        return (
          <ExpandedEditor
            value={item[expandedCell.column] ?? ''}
            title={columnLabels[expandedCell.column]}
            onSave={(v) => {
              handleSave(expandedCell.rowId, expandedCell.column, v);
              setExpandedCell(null);
            }}
            onClose={() => setExpandedCell(null)}
          />
        );
      })()}

      {/* 삭제 확인 */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { onDeleteItem(deleteTarget!); setDeleteTarget(null); }}
        title="행 삭제"
        message="선택한 업무항목을 삭제하시겠습니까?"
        confirmLabel="삭제"
        danger
      />
    </div>
  );
}

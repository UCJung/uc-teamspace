import React, { useState, useCallback, useMemo } from 'react';
import GridCell from './GridCell';
import ExpandedEditor from './ExpandedEditor';
import { WorkItem } from '../../api/weekly-report.api';
import { useGridStore } from '../../stores/gridStore';
import { ConfirmModal } from '../ui/Modal';
import Button from '../ui/Button';
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
  onUpdateItem: (id: string, data: Partial<Pick<WorkItem, 'doneWork' | 'planWork' | 'remarks'>>) => void;
  onAddItem: (projectId: string) => void;
  onDeleteItem: (id: string) => void;
  onDeleteProject: (projectId: string) => void;
}

type EditingCell = { rowId: string; column: 'doneWork' | 'planWork' | 'remarks' } | null;

// 컬럼 너비: 4% / 33% / 33% / 24% / 6%
const COLUMNS = [
  { id: 'index',    label: '#',                   width: '4%' },
  { id: 'doneWork', label: '진행업무 (한일)',       width: '33%' },
  { id: 'planWork', label: '예정업무 (할일)',       width: '33%' },
  { id: 'remarks',  label: '비고 및 이슈',          width: '24%' },
  { id: 'action',   label: '',                     width: '6%' },
];

interface ProjectGroup {
  projectId: string;
  project: WorkItem['project'];
  items: WorkItem[];
}

export default function EditableGrid({
  workItems,
  disabled = false,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onDeleteProject,
}: EditableGridProps) {
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [expandedCell, setExpandedCell] = useState<EditingCell>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<ProjectGroup | null>(null);
  const { markDirty } = useGridStore();

  // workItems를 projectId 기준으로 그룹핑 (최초 등장 순서 유지)
  const groups: ProjectGroup[] = useMemo(() => {
    const map = new Map<string, ProjectGroup>();
    const order: string[] = [];

    for (const item of workItems) {
      const key = item.projectId ?? '__no_project__';
      if (!map.has(key)) {
        map.set(key, {
          projectId: key,
          project: item.project,
          items: [],
        });
        order.push(key);
      }
      map.get(key)!.items.push(item);
    }

    return order.map((k) => map.get(k)!);
  }, [workItems]);

  const startEdit = useCallback(
    (rowId: string, column: 'doneWork' | 'planWork' | 'remarks') => {
      if (disabled) return;
      setEditingCell({ rowId, column });
    },
    [disabled],
  );

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

  return (
    <div className="flex flex-col gap-4">
      {workItems.length === 0 && (
        <div
          className="rounded-lg border border-[var(--gray-border)] py-14 text-center text-[13px]"
          style={{ color: 'var(--text-sub)' }}
        >
          추가된 프로젝트가 없습니다. 상단 [+ 프로젝트 추가] 버튼을 눌러 프로젝트를 추가하세요.
        </div>
      )}

      {groups.map((group) => (
        <div
          key={group.projectId}
          className="rounded-lg border border-[var(--gray-border)] overflow-hidden"
        >
          {/* 그룹 헤더 */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--gray-border)]"
            style={{ backgroundColor: 'var(--tbl-header)' }}
          >
            {/* 프로젝트명 pill */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
              style={{
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
              }}
            >
              {group.project?.name ?? '(프로젝트 없음)'}
            </span>

            {/* 프로젝트 코드 */}
            {group.project?.code && (
              <span
                className="text-[11px] font-mono tracking-widest"
                style={{ color: 'var(--text-sub)' }}
              >
                {group.project.code}
              </span>
            )}

            <div className="ml-auto flex items-center gap-2">
              {!disabled && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onAddItem(group.projectId)}
                    style={{ fontSize: '11px', padding: '3px 10px', height: 'auto' }}
                  >
                    + 업무 추가
                  </Button>
                  <button
                    className="text-[11px] px-2 py-1 rounded transition-colors"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => setDeleteProjectTarget(group)}
                    title="프로젝트 그룹 제거"
                  >
                    ✕ 제거
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 그룹 테이블 */}
          <div className="overflow-auto">
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                {COLUMNS.map((col) => (
                  <col key={col.id} style={{ width: col.width }} />
                ))}
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: 'var(--tbl-header)' }}>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.id}
                      className="text-left px-3 py-[7px] text-[11px] font-semibold border-b border-[var(--gray-border)] whitespace-nowrap tracking-wide uppercase"
                      style={{ color: 'var(--text-sub)' }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--gray-border)] transition-colors"
                    style={{
                      backgroundColor: idx % 2 === 0 ? 'var(--row-alt)' : 'white',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        'rgba(109, 92, 231, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        idx % 2 === 0 ? 'var(--row-alt)' : 'white';
                    }}
                  >
                    {/* 순번 */}
                    <td
                      className="px-3 py-[8px] align-top text-center text-[11px]"
                      style={{ color: 'var(--text-sub)', backgroundColor: 'var(--tbl-header)' }}
                    >
                      {idx + 1}
                    </td>

                    {/* 진행업무 */}
                    <td className="px-3 py-[8px] align-top text-[12.5px]">
                      <GridCell
                        value={item.doneWork}
                        isEditing={
                          editingCell?.rowId === item.id && editingCell?.column === 'doneWork'
                        }
                        onStartEdit={() => startEdit(item.id, 'doneWork')}
                        onEndEdit={endEdit}
                        onSave={(v) => handleSave(item.id, 'doneWork', v)}
                        disabled={disabled}
                        placeholder="진행업무 입력"
                        onOpenExpanded={() =>
                          setExpandedCell({ rowId: item.id, column: 'doneWork' })
                        }
                      />
                    </td>

                    {/* 예정업무 */}
                    <td className="px-3 py-[8px] align-top text-[12.5px]">
                      <GridCell
                        value={item.planWork}
                        isEditing={
                          editingCell?.rowId === item.id && editingCell?.column === 'planWork'
                        }
                        onStartEdit={() => startEdit(item.id, 'planWork')}
                        onEndEdit={endEdit}
                        onSave={(v) => handleSave(item.id, 'planWork', v)}
                        disabled={disabled}
                        placeholder="예정업무 입력"
                        onOpenExpanded={() =>
                          setExpandedCell({ rowId: item.id, column: 'planWork' })
                        }
                      />
                    </td>

                    {/* 비고 */}
                    <td className="px-3 py-[8px] align-top text-[12.5px]">
                      <GridCell
                        value={item.remarks ?? ''}
                        isEditing={
                          editingCell?.rowId === item.id && editingCell?.column === 'remarks'
                        }
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
                              className="mt-1.5 w-[26px] h-[26px] flex items-center justify-center rounded transition-colors text-[16px] leading-none"
                              style={{ color: 'var(--text-sub)' }}
                              title="행 옵션"
                              aria-label="행 옵션 메뉴"
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                  'var(--gray-light)';
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                  'transparent';
                                (e.currentTarget as HTMLButtonElement).style.color =
                                  'var(--text-sub)';
                              }}
                            >
                              ⋮
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                const col: 'doneWork' | 'planWork' | 'remarks' =
                                  editingCell?.rowId === item.id
                                    ? editingCell.column
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
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* 확대 편집 패널 */}
      {expandedCell &&
        (() => {
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

      {/* 행 삭제 확인 */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          onDeleteItem(deleteTarget!);
          setDeleteTarget(null);
        }}
        title="행 삭제"
        message="선택한 업무항목을 삭제하시겠습니까?"
        confirmLabel="삭제"
        danger
      />

      {/* 프로젝트 그룹 삭제 확인 */}
      <ConfirmModal
        open={!!deleteProjectTarget}
        onClose={() => setDeleteProjectTarget(null)}
        onConfirm={() => {
          onDeleteProject(deleteProjectTarget!.projectId);
          setDeleteProjectTarget(null);
        }}
        title="프로젝트 제거"
        message={`[${deleteProjectTarget?.project?.name ?? ''}] 프로젝트의 업무항목 ${deleteProjectTarget?.items.length ?? 0}개가 모두 삭제됩니다. 계속하시겠습니까?`}
        confirmLabel="제거"
        danger
      />
    </div>
  );
}

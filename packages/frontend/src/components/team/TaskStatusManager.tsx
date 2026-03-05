import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Check } from 'lucide-react';
import {
  useTaskStatuses,
  useCreateTaskStatus,
  useUpdateTaskStatus,
  useDeleteTaskStatus,
  useReorderTaskStatuses,
} from '../../hooks/useTaskStatuses';
import { TaskStatusDef, TaskStatusCategory, CreateTaskStatusDto } from '../../api/team.api';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ConfirmModal } from '../ui/Modal';
import Input from '../ui/Input';

// ── 색상 팔레트 ──────────────────────────────────────────────
const COLOR_PALETTE = [
  { hex: '#6C7A89', label: '회색' },
  { hex: '#6B5CE7', label: '보라' },
  { hex: '#27AE60', label: '초록' },
  { hex: '#F5A623', label: '주황' },
  { hex: '#E74C3C', label: '빨강' },
  { hex: '#3498DB', label: '파랑' },
];

const DEFAULT_COLOR = COLOR_PALETTE[0].hex;

// ── 카테고리 메타데이터 ───────────────────────────────────────
const CATEGORIES: { key: TaskStatusCategory; label: string }[] = [
  { key: 'BEFORE_START', label: '진행 전' },
  { key: 'IN_PROGRESS', label: '진행 중' },
  { key: 'COMPLETED', label: '완료' },
];

// ── 색상 원형 ────────────────────────────────────────────────
function ColorDot({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
}

// ── 색상 팔레트 선택 UI ──────────────────────────────────────
function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex gap-1.5 items-center">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c.hex}
          type="button"
          title={c.label}
          onClick={() => onChange(c.hex)}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: c.hex,
            border: value === c.hex ? '2.5px solid var(--text)' : '2px solid transparent',
            outline: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {value === c.hex && <Check size={11} color="white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}

// ── 인라인 추가/수정 폼 ──────────────────────────────────────
interface StatusFormProps {
  initialName?: string;
  initialColor?: string;
  initialCategory?: TaskStatusCategory;
  showCategory?: boolean;
  onConfirm: (name: string, color: string, category?: TaskStatusCategory) => void;
  onCancel: () => void;
  isPending?: boolean;
}

function StatusForm({
  initialName = '',
  initialColor = DEFAULT_COLOR,
  initialCategory,
  showCategory = false,
  onConfirm,
  onCancel,
  isPending = false,
}: StatusFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [category, setCategory] = useState<TaskStatusCategory>(
    initialCategory ?? 'BEFORE_START',
  );

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed, color, showCategory ? category : undefined);
  };

  return (
    <div
      className="border border-[var(--gray-border)] rounded-[6px] p-3 bg-[var(--gray-light)] flex flex-col gap-2"
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 20))}
        placeholder="상태명 입력 (최대 20자)"
        className="h-8 text-[12.5px]"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleConfirm();
          if (e.key === 'Escape') onCancel();
        }}
      />
      {showCategory && (
        <div className="flex gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={[
                'px-2.5 py-1 text-[11.5px] rounded border transition-colors',
                category === c.key
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'bg-white text-[var(--text-sub)] border-[var(--gray-border)] hover:border-[var(--primary)]',
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-[11.5px] text-[var(--text-sub)]">색상</span>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex gap-1.5 justify-end">
        <Button size="small" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button
          size="small"
          onClick={handleConfirm}
          disabled={!name.trim() || isPending}
        >
          확인
        </Button>
      </div>
    </div>
  );
}

// ── 드래그 가능한 상태 행 ─────────────────────────────────────
interface SortableStatusRowProps {
  status: TaskStatusDef;
  onEdit: (status: TaskStatusDef) => void;
  onDelete: (status: TaskStatusDef) => void;
  isEditing: boolean;
  onEditConfirm: (name: string, color: string) => void;
  onEditCancel: () => void;
  isPending: boolean;
}

function SortableStatusRow({
  status,
  onEdit,
  onDelete,
  isEditing,
  onEditConfirm,
  onEditCancel,
  isPending,
}: SortableStatusRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isEditing ? (
        <div className="px-2 py-1">
          <StatusForm
            initialName={status.name}
            initialColor={status.color}
            showCategory={false}
            onConfirm={onEditConfirm}
            onCancel={onEditCancel}
            isPending={isPending}
          />
        </div>
      ) : (
        <div
          className={[
            'flex items-center gap-2 px-3 py-2 rounded-[6px]',
            isDragging ? 'shadow-lg' : 'hover:bg-[var(--row-alt)]',
          ].join(' ')}
        >
          {/* 드래그 핸들 */}
          <span
            {...attributes}
            {...listeners}
            className="text-[var(--text-sub)] hover:text-[var(--text)] cursor-grab active:cursor-grabbing text-[14px] select-none"
            title="드래그하여 순서 변경"
          >
            ⠿
          </span>
          {/* 색상 원형 */}
          <ColorDot color={status.color} size={12} />
          {/* 상태명 */}
          <span className="flex-1 text-[13px] text-[var(--text)]">{status.name}</span>
          {/* 기본 상태 배지 */}
          {status.isDefault && (
            <Badge variant="purple">기본</Badge>
          )}
          {/* 수정 버튼 */}
          <button
            type="button"
            onClick={() => onEdit(status)}
            className="p-1 rounded text-[var(--text-sub)] hover:text-[var(--primary)] hover:bg-[var(--primary-bg)] transition-colors"
            title="수정"
          >
            <Pencil size={13} />
          </button>
          {/* 삭제 버튼 */}
          <button
            type="button"
            onClick={() => onDelete(status)}
            disabled={status.isDefault}
            className="p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-sub)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)]"
            title={status.isDefault ? '기본 상태는 삭제할 수 없습니다' : '삭제'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── 카테고리 섹션 ─────────────────────────────────────────────
interface CategorySectionProps {
  category: TaskStatusCategory;
  label: string;
  statuses: TaskStatusDef[];
  onEdit: (status: TaskStatusDef) => void;
  onDelete: (status: TaskStatusDef) => void;
  editingId: string | null;
  onEditConfirm: (id: string, name: string, color: string) => void;
  onEditCancel: () => void;
  onAddConfirm: (category: TaskStatusCategory, name: string, color: string) => void;
  isAddingInCategory: boolean;
  onStartAdd: (category: TaskStatusCategory) => void;
  onCancelAdd: () => void;
  isPending: boolean;
  onDragEnd: (event: DragEndEvent, category: TaskStatusCategory) => void;
}

function CategorySection({
  category,
  label,
  statuses,
  onEdit,
  onDelete,
  editingId,
  onEditConfirm,
  onEditCancel,
  onAddConfirm,
  isAddingInCategory,
  onStartAdd,
  onCancelAdd,
  isPending,
  onDragEnd,
}: CategorySectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div className="mb-4">
      {/* 카테고리 헤더 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] font-semibold text-[var(--text-sub)] uppercase tracking-wide">
          {label}
        </span>
        <span className="text-[11px] text-[var(--text-sub)]">({statuses.length})</span>
      </div>

      {/* 상태 목록 */}
      <div className="border border-[var(--gray-border)] rounded-[8px] bg-white overflow-hidden">
        {statuses.length === 0 && !isAddingInCategory && (
          <div className="px-3 py-4 text-[12px] text-[var(--text-sub)] text-center">
            상태가 없습니다.
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => onDragEnd(event, category)}
        >
          <SortableContext
            items={statuses.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {statuses.map((status) => (
              <SortableStatusRow
                key={status.id}
                status={status}
                onEdit={onEdit}
                onDelete={onDelete}
                isEditing={editingId === status.id}
                onEditConfirm={(name, color) => onEditConfirm(status.id, name, color)}
                onEditCancel={onEditCancel}
                isPending={isPending}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* 인라인 추가 폼 */}
        {isAddingInCategory && (
          <div className="px-2 py-2 border-t border-[var(--gray-border)]">
            <StatusForm
              showCategory={false}
              onConfirm={(name, color) => onAddConfirm(category, name, color)}
              onCancel={onCancelAdd}
              isPending={isPending}
            />
          </div>
        )}

        {/* 상태 추가 버튼 */}
        {!isAddingInCategory && (
          <button
            type="button"
            onClick={() => onStartAdd(category)}
            className="flex items-center gap-1.5 w-full px-3 py-2 text-[12px] text-[var(--text-sub)] hover:text-[var(--primary)] hover:bg-[var(--primary-bg)] border-t border-[var(--gray-border)] transition-colors"
          >
            <Plus size={13} />
            상태 추가
          </button>
        )}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
interface TaskStatusManagerProps {
  teamId: string;
}

export default function TaskStatusManager({ teamId }: TaskStatusManagerProps) {
  const { data: statuses = [], isLoading } = useTaskStatuses(teamId);
  const createMutation = useCreateTaskStatus(teamId);
  const updateMutation = useUpdateTaskStatus(teamId);
  const deleteMutation = useDeleteTaskStatus(teamId);
  const reorderMutation = useReorderTaskStatuses(teamId);

  // 편집/추가 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState<TaskStatusCategory | null>(null);

  // 삭제 확인 다이얼로그
  const [deleteTarget, setDeleteTarget] = useState<TaskStatusDef | null>(null);

  // 로컬 정렬 상태 (낙관적 업데이트)
  const [localStatuses, setLocalStatuses] = useState<TaskStatusDef[]>([]);

  useEffect(() => {
    setLocalStatuses(statuses);
  }, [statuses]);

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // 카테고리별 필터
  const byCategory = (cat: TaskStatusCategory) =>
    localStatuses.filter((s) => s.category === cat).sort((a, b) => a.sortOrder - b.sortOrder);

  // 드래그 완료 — 카테고리 내 순서 변경
  const handleDragEnd = (event: DragEndEvent, category: TaskStatusCategory) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const categoryItems = byCategory(category);
    const oldIndex = categoryItems.findIndex((s) => s.id === active.id);
    const newIndex = categoryItems.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(categoryItems, oldIndex, newIndex);

    // 낙관적 로컬 업데이트
    setLocalStatuses((prev) => {
      const others = prev.filter((s) => s.category !== category);
      const updated = reordered.map((s, i) => ({ ...s, sortOrder: i + 1 }));
      return [...others, ...updated];
    });

    // 서버에 반영
    const items = reordered.map((s, i) => ({ id: s.id, sortOrder: i + 1 }));
    reorderMutation.mutate(items, {
      onError: () => {
        toast.error('순서 변경에 실패했습니다.');
        setLocalStatuses(statuses); // rollback
      },
    });
  };

  // 상태 추가
  const handleAddConfirm = async (
    category: TaskStatusCategory,
    name: string,
    color: string,
  ) => {
    const dto: CreateTaskStatusDto = { name, category, color };
    try {
      await createMutation.mutateAsync(dto);
      toast.success(`"${name}" 상태가 추가되었습니다.`);
      setAddingCategory(null);
    } catch {
      toast.error('상태 추가에 실패했습니다.');
    }
  };

  // 상태 수정
  const handleEditConfirm = async (id: string, name: string, color: string) => {
    try {
      await updateMutation.mutateAsync({ id, dto: { name, color } });
      toast.success('상태가 수정되었습니다.');
      setEditingId(null);
    } catch {
      toast.error('상태 수정에 실패했습니다.');
    }
  };

  // 상태 삭제
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" 상태가 삭제되었습니다.`);
      setDeleteTarget(null);
    } catch {
      toast.error('상태 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center text-[13px] text-[var(--text-sub)]">
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-[12.5px] text-[var(--text-sub)]">
          카테고리 내에서 드래그하여 상태 순서를 변경할 수 있습니다.
        </p>
      </div>

      {CATEGORIES.map(({ key, label }) => (
        <CategorySection
          key={key}
          category={key}
          label={label}
          statuses={byCategory(key)}
          onEdit={(s) => {
            setAddingCategory(null);
            setEditingId(s.id);
          }}
          onDelete={(s) => setDeleteTarget(s)}
          editingId={editingId}
          onEditConfirm={handleEditConfirm}
          onEditCancel={() => setEditingId(null)}
          onAddConfirm={handleAddConfirm}
          isAddingInCategory={addingCategory === key}
          onStartAdd={(cat) => {
            setEditingId(null);
            setAddingCategory(cat);
          }}
          onCancelAdd={() => setAddingCategory(null)}
          isPending={isPending}
          onDragEnd={handleDragEnd}
        />
      ))}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="상태 삭제"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" 상태를 삭제하시겠습니까? 이 상태에 속한 작업이 기본 상태로 이전됩니다.`
            : ''
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        danger
      />
    </div>
  );
}

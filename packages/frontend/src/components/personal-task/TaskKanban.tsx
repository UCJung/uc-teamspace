import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { PersonalTask, TaskStatus } from '../../api/personal-task.api';
import {
  useToggleDonePersonalTask,
  useUpdatePersonalTask,
  useReorderPersonalTasks,
} from '../../hooks/usePersonalTasks';
import TaskKanbanCard from './TaskKanbanCard';
import { TASK_STATUS_LABEL } from '../../constants/labels';

interface TaskKanbanProps {
  tasks: PersonalTask[];
  isLoading: boolean;
  selectedTaskId?: string;
  onSelectTask: (task: PersonalTask) => void;
}

interface ColumnConfig {
  status: TaskStatus;
  headerBg: string;
  headerColor: string;
  columnBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'TODO',
    headerBg: 'var(--gray-light)',
    headerColor: 'var(--text-sub)',
    columnBg: 'var(--gray-light)',
  },
  {
    status: 'IN_PROGRESS',
    headerBg: 'var(--primary-bg)',
    headerColor: 'var(--primary)',
    columnBg: 'var(--primary-bg)',
  },
  {
    status: 'DONE',
    headerBg: 'var(--ok-bg)',
    headerColor: 'var(--ok)',
    columnBg: 'var(--ok-bg)',
  },
];

// Droppable column container
function KanbanColumn({
  status,
  tasks,
  config,
  selectedTaskId,
  onSelectTask,
}: {
  status: TaskStatus;
  tasks: PersonalTask[];
  config: ColumnConfig;
  selectedTaskId?: string;
  onSelectTask: (task: PersonalTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });

  return (
    <div
      className="flex flex-col flex-1 min-w-0 rounded-xl overflow-hidden"
      style={{
        border: '1px solid var(--gray-border)',
        minWidth: 220,
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ backgroundColor: config.headerBg }}
      >
        <span className="text-[13px] font-semibold" style={{ color: config.headerColor }}>
          {TASK_STATUS_LABEL[status]}
        </span>
        <span
          className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: config.headerColor + '22', color: config.headerColor }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto transition-colors"
        style={{
          backgroundColor: isOver ? config.headerBg : config.columnBg,
          minHeight: 300,
        }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskKanbanCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelectTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            className="flex-1 flex items-center justify-center text-[12px] rounded-lg border-2 border-dashed"
            style={{
              color: 'var(--gray-border)',
              borderColor: 'var(--gray-border)',
              minHeight: 80,
            }}
          >
            {isOver ? '여기에 놓기' : '없음'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TaskKanban({
  tasks,
  isLoading,
  selectedTaskId,
  onSelectTask,
}: TaskKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<PersonalTask[]>([]);

  // Sync localTasks from prop when not dragging
  React.useEffect(() => {
    if (!activeId) {
      setLocalTasks(tasks);
    }
  }, [tasks, activeId]);

  const toggleMutation = useToggleDonePersonalTask();
  const updateMutation = useUpdatePersonalTask();
  const reorderMutation = useReorderPersonalTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const displayTasks = activeId ? localTasks : tasks;

  const todoTasks = displayTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = displayTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = displayTasks.filter((t) => t.status === 'DONE');

  const getColumnTasks = (status: TaskStatus) => {
    if (status === 'TODO') return todoTasks;
    if (status === 'IN_PROGRESS') return inProgressTasks;
    return doneTasks;
  };

  const getTaskStatus = (taskId: string): TaskStatus | undefined =>
    displayTasks.find((t) => t.id === taskId)?.status;

  // Detect which column an item is being dragged over
  const getOverStatus = (event: DragOverEvent): TaskStatus | null => {
    const overId = event.over?.id as string | undefined;
    if (!overId) return null;

    // Over a column droppable
    if (overId.startsWith('column-')) {
      return overId.replace('column-', '') as TaskStatus;
    }

    // Over another card — use that card's status
    const overTask = displayTasks.find((t) => t.id === overId);
    return overTask?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setLocalTasks(tasks);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const activeTaskId = event.active.id as string;
    const overStatus = getOverStatus(event);
    if (!overStatus) return;

    const activeStatus = getTaskStatus(activeTaskId);
    if (!activeStatus || activeStatus === overStatus) return;

    // Move card to new column optimistically
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === activeTaskId ? { ...t, status: overStatus } : t)),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeTaskId);
    if (!activeTask) return;

    // Determine new status
    let newStatus: TaskStatus | null = null;
    if (overId.startsWith('column-')) {
      newStatus = overId.replace('column-', '') as TaskStatus;
    } else {
      const overTask = localTasks.find((t) => t.id === overId);
      newStatus = overTask?.status ?? null;
    }

    if (!newStatus) return;

    const oldStatus = activeTask.status;

    if (newStatus !== oldStatus) {
      // Cross-column move → update status via API
      if (newStatus === 'DONE') {
        // Use toggleDone to set to DONE (if not already)
        if (activeTask.status !== 'DONE') {
          toggleMutation.mutate(activeTaskId);
        }
      } else if (oldStatus === 'DONE') {
        // Undo done
        toggleMutation.mutate(activeTaskId);
      } else {
        // TODO ↔ IN_PROGRESS
        updateMutation.mutate({
          id: activeTaskId,
          dto: {
            status: newStatus,
          },
        });
      }
    } else {
      // Same column: reorder
      const columnTasks = localTasks.filter((t) => t.status === newStatus);
      const oldIndex = columnTasks.findIndex((t) => t.id === activeTaskId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);

      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      const items = reordered.map((t, idx) => ({ id: t.id, sortOrder: idx + 1 }));
      reorderMutation.mutate({ items });
    }
  };

  if (isLoading) {
    return (
      <div
        className="rounded-lg border px-4 py-10 text-center text-[13px]"
        style={{
          borderColor: 'var(--gray-border)',
          backgroundColor: 'var(--white)',
          color: 'var(--text-sub)',
        }}
      >
        불러오는 중...
      </div>
    );
  }

  const activeTask = activeId ? displayTasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 h-full overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            tasks={getColumnTasks(col.status)}
            config={col}
            selectedTaskId={selectedTaskId}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask ? (
          <TaskKanbanCard
            task={activeTask}
            onSelect={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

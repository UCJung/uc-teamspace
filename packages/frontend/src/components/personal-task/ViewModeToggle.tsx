import React from 'react';
import { LayoutGrid, List, CalendarDays } from 'lucide-react';

export type ViewMode = 'kanban' | 'list' | 'weekly';

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { key: ViewMode; icon: React.ReactNode; label: string }[] = [
  { key: 'kanban', icon: <LayoutGrid size={15} />, label: '칸반' },
  { key: 'list', icon: <List size={15} />, label: '목록' },
  { key: 'weekly', icon: <CalendarDays size={15} />, label: '주간' },
];

export default function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="flex items-center rounded-lg p-0.5 gap-0.5"
      style={{ backgroundColor: 'var(--gray-light)', border: '1px solid var(--gray-border)' }}
    >
      {MODES.map(({ key, icon, label }) => {
        const isActive = mode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all"
            style={
              isActive
                ? {
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: 'var(--text-sub)',
                  }
            }
            aria-pressed={isActive}
            title={label}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { Project } from '../../api/project.api';

interface ProjectDropdownProps {
  value: string; // projectId
  onChange: (project: Project) => void;
  onClose: () => void;
}

export default function ProjectDropdown({ value, onChange, onClose }: ProjectDropdownProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data } = useProjects({ status: 'ACTIVE' });
  const projects = data?.data ?? [];

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="absolute z-50 bg-white border border-[var(--gray-border)] rounded shadow-lg w-[280px] max-h-[240px] overflow-hidden flex flex-col">
      <div className="p-2 border-b border-[var(--gray-border)]">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="프로젝트 검색..."
          className="w-full h-7 px-2 border border-[var(--gray-border)] rounded text-[11px] outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
          }}
        />
      </div>
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 && (
          <div className="text-[11px] text-[var(--text-sub)] text-center py-4">
            결과 없음
          </div>
        )}
        {filtered.map((project) => (
          <button
            key={project.id}
            className={[
              'w-full text-left px-3 py-2 text-[11px] hover:bg-[var(--primary-bg)] transition-colors',
              project.id === value ? 'bg-[var(--primary-bg)] text-[var(--primary)]' : 'text-[var(--text)]',
            ].join(' ')}
            onClick={() => {
              onChange(project);
              onClose();
            }}
          >
            <div className="font-medium">{project.name}</div>
            <div className="text-[var(--text-sub)] font-mono text-[10px]">{project.code}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import { useProjects } from '../../hooks/useProjects';
import { Project } from '../../api/project.api';

interface ProjectSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (project: Project) => void;
  alreadySelectedIds: string[];
}

export default function ProjectSelectModal({
  open,
  onClose,
  onSelect,
  alreadySelectedIds,
}: ProjectSelectModalProps) {
  const [search, setSearch] = useState('');
  const { data: projectsResponse, isLoading } = useProjects({ status: 'ACTIVE' });

  const projects: Project[] = useMemo(() => {
    const raw = projectsResponse as Project[] | { data: Project[] } | undefined;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if ('data' in raw && Array.isArray(raw.data)) return raw.data;
    return [];
  }, [projectsResponse]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.trim().toLowerCase();
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  }, [projects, search]);

  const commonProjects = filtered.filter((p) => p.category === 'COMMON');
  const executionProjects = filtered.filter((p) => p.category === 'EXECUTION');

  const handleSelect = (project: Project) => {
    if (alreadySelectedIds.includes(project.id)) return;
    onSelect(project);
    onClose();
    setSearch('');
  };

  const handleClose = () => {
    onClose();
    setSearch('');
  };

  return (
    <Modal open={open} onClose={handleClose} title="프로젝트 추가">
      <div className="w-[440px] max-w-full -mx-5 -mt-5 px-5 pt-5 flex flex-col gap-3">
        {/* 검색 */}
        <input
          type="text"
          placeholder="프로젝트 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-[13px] border border-[var(--gray-border)] rounded-md outline-none focus:border-[var(--primary)] transition-colors"
          style={{ color: 'var(--text)', backgroundColor: 'white' }}
          autoFocus
        />

        {/* 목록 */}
        <div className="max-h-[360px] overflow-y-auto -mx-5 px-5">
          {isLoading ? (
            <p className="text-center py-8 text-[12px] text-[var(--text-sub)]">로딩 중...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-[12px] text-[var(--text-sub)]">검색 결과가 없습니다.</p>
          ) : (
            <div className="flex flex-col pb-2">
              {commonProjects.length > 0 && (
                <>
                  <div
                    className="px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase"
                    style={{ backgroundColor: 'var(--tbl-header)', color: 'var(--text-sub)' }}
                  >
                    공통 업무 (COMMON)
                  </div>
                  {commonProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isSelected={alreadySelectedIds.includes(project.id)}
                      onSelect={handleSelect}
                    />
                  ))}
                </>
              )}
              {executionProjects.length > 0 && (
                <>
                  <div
                    className="px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase"
                    style={{ backgroundColor: 'var(--tbl-header)', color: 'var(--text-sub)' }}
                  >
                    수행 과제 (EXECUTION)
                  </div>
                  {executionProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isSelected={alreadySelectedIds.includes(project.id)}
                      onSelect={handleSelect}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface ProjectItemProps {
  project: Project;
  isSelected: boolean;
  onSelect: (project: Project) => void;
}

function ProjectItem({ project, isSelected, onSelect }: ProjectItemProps) {
  return (
    <button
      className="w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors border-b border-[var(--gray-border)]"
      style={{
        backgroundColor: isSelected ? 'var(--gray-light)' : 'white',
        cursor: isSelected ? 'not-allowed' : 'pointer',
      }}
      disabled={isSelected}
      onClick={() => onSelect(project)}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--primary-bg)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = isSelected
          ? 'var(--gray-light)'
          : 'white';
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span
          className="text-[13px] font-medium"
          style={{ color: isSelected ? 'var(--text-sub)' : 'var(--text)' }}
        >
          {project.name}
        </span>
        <span
          className="text-[10.5px] font-mono tracking-widest"
          style={{ color: 'var(--text-sub)' }}
        >
          {project.code}
        </span>
      </div>
      {isSelected && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: 'var(--gray-border)',
            color: 'var(--text-sub)',
          }}
        >
          추가됨
        </span>
      )}
    </button>
  );
}

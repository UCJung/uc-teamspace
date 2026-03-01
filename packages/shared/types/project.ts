export type ProjectCategory = 'COMMON' | 'EXECUTION';
export type ProjectStatus = 'ACTIVE' | 'HOLD' | 'COMPLETED';

export interface Project {
  id: string;
  name: string;
  code: string;
  category: ProjectCategory;
  status: ProjectStatus;
  teamId: string;
}

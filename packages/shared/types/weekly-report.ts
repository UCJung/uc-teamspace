export type ReportStatus = 'DRAFT' | 'SUBMITTED';

export interface WeeklyReport {
  id: string;
  memberId: string;
  weekStart: Date;
  weekLabel: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkItem {
  id: string;
  weeklyReportId: string;
  projectId: string;
  doneWork: string;
  planWork: string;
  remarks?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartSummary {
  id: string;
  partId: string;
  weekStart: Date;
  weekLabel: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SummaryWorkItem {
  id: string;
  partSummaryId: string;
  projectId: string;
  doneWork: string;
  planWork: string;
  remarks?: string | null;
  sortOrder: number;
}

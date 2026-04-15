export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'IN_PROGRESS'
  | 'WON'
  | 'LOST';

export type Lead = {
  id: number;
  name: string;
  email?: string;
  company?: string;
  status: LeadStatus;
  value?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedLeads = {
  data: Lead[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Comment = {
  id: number;
  leadId: number;
  text: string;
  createdAt: string;
};

import type { Comment, Lead, LeadStatus, PaginatedLeads } from './api-types';

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (base === undefined || base.length === 0) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }
  return base.replace(/\/$/, '');
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === 'object' &&
      body !== null &&
      'message' in body
    ) {
      const message = (body as { message: unknown }).message;
      if (Array.isArray(message)) {
        return message.map(String).join(', ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || 'Request failed';
}

export async function fetchLeads(params: {
  page: number;
  limit: number;
  q?: string;
  status?: LeadStatus;
  sort: 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}): Promise<PaginatedLeads> {
  const url = new URL(`${getApiBaseUrl()}/api/leads`);
  url.searchParams.set('page', String(params.page));
  url.searchParams.set('limit', String(params.limit));
  url.searchParams.set('sort', params.sort);
  url.searchParams.set('order', params.order);
  if (params.q !== undefined && params.q.trim().length > 0) {
    url.searchParams.set('q', params.q.trim());
  }
  if (params.status !== undefined) {
    url.searchParams.set('status', params.status);
  }
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<PaginatedLeads>;
}

export async function createLead(input: {
  name: string;
  email?: string;
  company?: string;
  status: LeadStatus;
  value?: number;
  notes?: string;
}): Promise<Lead> {
  const response = await fetch(`${getApiBaseUrl()}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<Lead>;
}

export async function fetchLead(id: number): Promise<Lead> {
  const response = await fetch(`${getApiBaseUrl()}/api/leads/${id}`, {
    cache: 'no-store',
  });
  if (response.status === 404) {
    throw new Error('Lead not found');
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<Lead>;
}

export async function updateLead(
  id: number,
  input: Partial<{
    name: string;
    email?: string;
    company?: string;
    status: LeadStatus;
    value?: number;
    notes?: string;
  }>,
): Promise<Lead> {
  const response = await fetch(`${getApiBaseUrl()}/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (response.status === 404) {
    throw new Error('Lead not found');
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<Lead>;
}

export async function deleteLead(id: number): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/leads/${id}`, {
    method: 'DELETE',
  });
  if (response.status === 404) {
    throw new Error('Lead not found');
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function fetchComments(leadId: number): Promise<Comment[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/leads/${leadId}/comments`,
    { cache: 'no-store' },
  );
  if (response.status === 404) {
    throw new Error('Lead not found');
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<Comment[]>;
}

export async function createComment(
  leadId: number,
  text: string,
): Promise<Comment> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/leads/${leadId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    },
  );
  if (response.status === 404) {
    throw new Error('Lead not found');
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json() as Promise<Comment>;
}

export const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'IN_PROGRESS',
  'WON',
  'LOST',
];

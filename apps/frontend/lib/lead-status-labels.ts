import type { LeadStatus } from './api-types';

const LEAD_STATUS_LABELS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  IN_PROGRESS: 'In progress',
  WON: 'Won',
  LOST: 'Lost',
} as const satisfies Record<LeadStatus, string>;

const LEAD_STATUS_BADGE_CLASS_NAMES = {
  NEW:
    'inline-flex rounded-md border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800',
  CONTACTED:
    'inline-flex rounded-md border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-800',
  IN_PROGRESS:
    'inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900',
  WON:
    'inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800',
  LOST:
    'inline-flex rounded-md border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-800',
} as const satisfies Record<LeadStatus, string>;

/**
 * Returns a human-readable label for API lead status values.
 */
export function getLeadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_LABELS[status];
}

/**
 * Returns Tailwind CSS class names for a status pill/badge in the leads grid.
 */
export function getLeadStatusBadgeClassName(status: LeadStatus): string {
  return LEAD_STATUS_BADGE_CLASS_NAMES[status];
}

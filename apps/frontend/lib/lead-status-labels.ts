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
    'rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800',
  CONTACTED:
    'rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800',
  IN_PROGRESS:
    'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800',
  WON:
    'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800',
  LOST:
    'rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800',
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

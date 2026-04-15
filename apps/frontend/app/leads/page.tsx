'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { deleteLead, fetchLeads, LEAD_STATUS_OPTIONS } from '@/lib/api-client';
import {
  getLeadStatusBadgeClassName,
  getLeadStatusLabel,
} from '@/lib/lead-status-labels';
import type { Lead, LeadStatus } from '@/lib/api-types';

const DEFAULT_LIMIT = 10;

export default function LeadsPage(): React.ReactElement {
  const [items, setItems] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [qInput, setQInput] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [sort, setSort] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLeads({
        page,
        limit,
        q: q.length > 0 ? q : undefined,
        status: status === '' ? undefined : status,
        sort,
        order,
      });
      setItems(result.data);
      setTotalPages(result.meta.totalPages);
      setTotal(result.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [limit, order, page, q, sort, status]);

  useEffect(() => {
    void load();
  }, [load]);

  function applyFilters(): void {
    setQ(qInput);
    setPage(1);
  }

  const hasNonDefaultFilters =
    page !== 1 ||
    q !== '' ||
    qInput !== '' ||
    status !== '' ||
    sort !== 'createdAt' ||
    order !== 'desc';

  function resetFilters(): void {
    setQ('');
    setQInput('');
    setStatus('');
    setSort('createdAt');
    setOrder('desc');
    setPage(1);
  }

  async function handleDeleteLead(leadId: number): Promise<void> {
    if (!window.confirm('Delete this lead? This cannot be undone.')) {
      return;
    }
    setDeletingId(leadId);
    setError(null);
    try {
      await deleteLead(leadId);
      const isLastOnPage = items.length === 1;
      const shouldGoToPrevPage = isLastOnPage && page > 1;
      if (shouldGoToPrevPage) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Leads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and manage your pipeline.
          </p>
        </div>
      </div>
      <section className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-primary-soft p-4 shadow-sm md:flex-row md:flex-wrap md:items-end">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Search</span>
          <input
            className="ui-input w-full min-w-[200px] md:w-64"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Name, email, company"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Status</span>
          <select
            className="ui-select"
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value === ''
                  ? ''
                  : (e.target.value as LeadStatus),
              )
            }
          >
            <option value="">All</option>
            {LEAD_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {getLeadStatusLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Sort</span>
          <select
            className="ui-select"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as 'createdAt' | 'updatedAt')
            }
          >
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Order</span>
          <select
            className="ui-select"
            value={order}
            onChange={(e) =>
              setOrder(e.target.value as 'asc' | 'desc')
            }
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyFilters()}
            className="ui-btn-secondary"
          >
            Apply
          </button>
          <button
            type="button"
            disabled={!hasNonDefaultFilters}
            onClick={() => resetFilters()}
            className="ui-btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset
          </button>
        </div>
      </section>
      {error !== null ? (
        <div className="ui-alert-danger mb-4" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading leads…</p>
      ) : total === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-muted-foreground shadow-card">
          No leads match your criteria.{' '}
          <Link
            href="/leads/new"
            className="font-medium text-primary hover:underline"
          >
            Create a lead
          </Link>{' '}
          or adjust filters.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-border transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.company ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={getLeadStatusBadgeClassName(lead.status)}
                      >
                        {getLeadStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.value !== undefined && lead.value !== null
                        ? String(lead.value)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(lead.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          aria-label="Edit lead"
                          title="Edit lead"
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring-focus)] focus-visible:ring-offset-2 ${
                            deletingId === lead.id
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-4 w-4"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          aria-label="Delete lead"
                          title="Delete lead"
                          disabled={deletingId !== null}
                          onClick={() => void handleDeleteLead(lead.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-surface text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-4 w-4"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.688-3.921V8.25a2.25 2.25 0 0 0-2.25-2.25h-7.5a2.25 2.25 0 0 0-2.25 2.25v-.75a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v.75m-13.5-3V18a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 18v-9"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages || 1} — {total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="ui-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((p) =>
                    totalPages === 0 ? p : Math.min(totalPages, p + 1),
                  )
                }
                className="ui-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

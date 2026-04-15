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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Leads</h1>
      </div>
      <section className="mb-4 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 md:flex-row md:flex-wrap md:items-end">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Search</span>
          <input
            className="w-full min-w-[200px] rounded border border-zinc-300 bg-white px-3 py-2 md:w-64"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Name, email, company"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Status</span>
          <select
            className="rounded border border-zinc-300 bg-white px-3 py-2"
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Sort</span>
          <select
            className="rounded border border-zinc-300 bg-white px-3 py-2"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as 'createdAt' | 'updatedAt')
            }
          >
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Order</span>
          <select
            className="rounded border border-zinc-300 bg-white px-3 py-2"
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
            className="rounded bg-white px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-300 hover:bg-zinc-100"
          >
            Apply
          </button>
          <button
            type="button"
            disabled={!hasNonDefaultFilters}
            onClick={() => resetFilters()}
            className="rounded bg-white px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset
          </button>
        </div>
      </section>
      {error !== null ? (
        <div
          className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {loading ? (
        <p className="text-sm text-zinc-600">Loading leads…</p>
      ) : total === 0 ? (
        <p className="rounded border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-zinc-600">
          No leads match your criteria.{' '}
          <Link
            href="/leads/new"
            className="font-medium text-blue-700 hover:underline"
          >
            Create a lead
          </Link>{' '}
          or adjust filters.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-700">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Company</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Value</th>
                  <th className="px-4 py-2 font-medium">Updated</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-zinc-100 hover:bg-zinc-50"
                  >
                    <td className="px-4 py-2 font-medium text-zinc-900">
                      {lead.name}
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {lead.email ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {lead.company ?? '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={getLeadStatusBadgeClassName(lead.status)}
                      >
                        {getLeadStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {lead.value !== undefined && lead.value !== null
                        ? String(lead.value)
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-zinc-600">
                      {new Date(lead.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          aria-label="Edit lead"
                          title="Edit lead"
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 ${
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
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
            <p className="text-sm text-zinc-600">
              Page {page} of {totalPages || 1} — {total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded border border-zinc-300 bg-white px-3 py-1 text-sm disabled:opacity-40"
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
                className="rounded border border-zinc-300 bg-white px-3 py-1 text-sm disabled:opacity-40"
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

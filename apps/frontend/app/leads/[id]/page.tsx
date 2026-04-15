'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  createComment,
  deleteLead,
  fetchComments,
  fetchLead,
  LEAD_STATUS_OPTIONS,
  updateLead,
} from '@/lib/api-client';
import { getLeadStatusLabel } from '@/lib/lead-status-labels';
import type { Comment, Lead, LeadStatus } from '@/lib/api-types';

export default function LeadDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const idParam = params.id;
  const leadId =
    typeof idParam === 'string'
      ? Number.parseInt(idParam, 10)
      : Number.NaN;

  const [lead, setLead] = useState<Lead | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    if (Number.isNaN(leadId)) {
      setError('Invalid lead id');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [leadData, commentData] = await Promise.all([
        fetchLead(leadId),
        fetchComments(leadId),
      ]);
      setLead(leadData);
      setName(leadData.name);
      setEmail(leadData.email ?? '');
      setCompany(leadData.company ?? '');
      setStatus(leadData.status);
      setValue(
        leadData.value !== undefined && leadData.value !== null
          ? String(leadData.value)
          : '',
      );
      setNotes(leadData.notes ?? '');
      setComments(commentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead');
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (Number.isNaN(leadId)) {
      return;
    }
    setSaveError(null);
    if (name.trim().length === 0) {
      setSaveError('Name is required');
      return;
    }
    setSaving(true);
    try {
      const numValue =
        value.trim().length === 0 ? undefined : Number(value);
      if (value.trim().length > 0 && Number.isNaN(numValue as number)) {
        setSaveError('Value must be a number');
        setSaving(false);
        return;
      }
      const updated = await updateLead(leadId, {
        name: name.trim(),
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        status,
        value: numValue,
        notes: notes.trim() || undefined,
      });
      setLead(updated);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (Number.isNaN(leadId)) {
      return;
    }
    if (!window.confirm('Delete this lead? This cannot be undone.')) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteLead(leadId);
      router.push('/leads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddComment(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (Number.isNaN(leadId)) {
      return;
    }
    setCommentError(null);
    if (commentText.trim().length === 0) {
      setCommentError('Comment cannot be empty');
      return;
    }
    setAddingComment(true);
    try {
      const created = await createComment(leadId, commentText.trim());
      setComments((prev) => [...prev, created]);
      setCommentText('');
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : 'Failed to add comment',
      );
    } finally {
      setAddingComment(false);
    }
  }

  if (Number.isNaN(leadId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-red-600">Invalid lead id.</p>
        <Link href="/leads" className="mt-4 inline-block text-blue-700">
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/leads"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to leads
        </Link>
        {lead !== null ? (
          <span className="text-sm text-zinc-500">
            Lead #{lead.id} · created{' '}
            {new Date(lead.createdAt).toLocaleString()}
          </span>
        ) : null}
      </div>
      {error !== null && lead === null && !loading ? (
        <div
          className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {loading ? (
        <p className="text-sm text-zinc-600">Loading lead…</p>
      ) : lead === null ? (
        <p className="text-zinc-600">Lead not found.</p>
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-semibold text-zinc-900">
            {lead.name}
          </h1>
          <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-medium text-zinc-800">
              Edit lead
            </h2>
            <form
              onSubmit={(e) => void handleSave(e)}
              className="grid gap-3 md:grid-cols-2"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Name *</span>
                <input
                  className="rounded border border-zinc-300 px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Email</span>
                <input
                  type="email"
                  className="rounded border border-zinc-300 px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Company</span>
                <input
                  className="rounded border border-zinc-300 px-3 py-2"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Status</span>
                <select
                  className="rounded border border-zinc-300 px-3 py-2"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as LeadStatus)
                  }
                >
                  {LEAD_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {getLeadStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Value</span>
                <input
                  className="rounded border border-zinc-300 px-3 py-2"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Notes</span>
                <textarea
                  className="min-h-[96px] rounded border border-zinc-300 px-3 py-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void handleDelete()}
                  className="rounded border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete lead'}
                </button>
                {saveError !== null ? (
                  <span className="text-sm text-red-600">{saveError}</span>
                ) : null}
              </div>
            </form>
          </section>
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-medium text-zinc-800">
              Comments
            </h2>
            {comments.length === 0 ? (
              <p className="mb-4 text-sm text-zinc-600">
                No comments yet. Add one below.
              </p>
            ) : (
              <ul className="mb-4 space-y-3">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm"
                  >
                    <p className="text-zinc-900">{c.text}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <form
              onSubmit={(e) => void handleAddComment(e)}
              className="flex flex-col gap-2"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">
                  New comment (1–500 characters)
                </span>
                <textarea
                  className="min-h-[80px] rounded border border-zinc-300 px-3 py-2"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={addingComment}
                  className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {addingComment ? 'Adding…' : 'Add comment'}
                </button>
                {commentError !== null ? (
                  <span className="text-sm text-red-600">
                    {commentError}
                  </span>
                ) : null}
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

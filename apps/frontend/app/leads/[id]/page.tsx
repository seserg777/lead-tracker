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
      <div className="mx-auto max-w-3xl">
        <p className="text-danger">Invalid lead id.</p>
        <Link
          href="/leads"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/leads"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to leads
        </Link>
        {lead !== null ? (
          <span className="text-sm text-muted-foreground">
            Lead #{lead.id} · created{' '}
            {new Date(lead.createdAt).toLocaleString()}
          </span>
        ) : null}
      </div>
      {error !== null && lead === null && !loading ? (
        <div className="ui-alert-danger mb-4" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading lead…</p>
      ) : lead === null ? (
        <p className="text-muted-foreground">Lead not found.</p>
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
            {lead.name}
          </h1>
          <section className="ui-card mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Edit lead
            </h2>
            <form
              onSubmit={(e) => void handleSave(e)}
              className="grid gap-4 md:grid-cols-2"
            >
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Name *</span>
                <input
                  className="ui-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Email</span>
                <input
                  type="email"
                  className="ui-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Company</span>
                <input
                  className="ui-input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Status</span>
                <select
                  className="ui-select"
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
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Value</span>
                <input
                  className="ui-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Notes</span>
                <textarea
                  className="ui-textarea min-h-[96px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="ui-btn-primary"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => void handleDelete()}
                  className="ui-btn-danger"
                >
                  {deleting ? 'Deleting…' : 'Delete lead'}
                </button>
                {saveError !== null ? (
                  <span className="text-sm text-danger">{saveError}</span>
                ) : null}
              </div>
            </form>
          </section>
          <section className="ui-card">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Comments
            </h2>
            {comments.length === 0 ? (
              <p className="mb-4 text-sm text-muted-foreground">
                No comments yet. Add one below.
              </p>
            ) : (
              <ul className="mb-4 space-y-3">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm"
                  >
                    <p className="text-foreground">{c.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <form
              onSubmit={(e) => void handleAddComment(e)}
              className="flex flex-col gap-3"
            >
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">
                  New comment (1–500 characters)
                </span>
                <textarea
                  className="ui-textarea min-h-[80px]"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={addingComment}
                  className="ui-btn-primary"
                >
                  {addingComment ? 'Adding…' : 'Add comment'}
                </button>
                {commentError !== null ? (
                  <span className="text-sm text-danger">{commentError}</span>
                ) : null}
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createLead, LEAD_STATUS_OPTIONS } from '@/lib/api-client';
import { getLeadStatusLabel } from '@/lib/lead-status-labels';
import type { LeadStatus } from '@/lib/api-types';

type CreateLeadFormProps = {
  readonly onSuccess?: () => void | Promise<void>;
};

export function CreateLeadForm({
  onSuccess,
}: CreateLeadFormProps): React.ReactElement {
  const router = useRouter();
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formStatus, setFormStatus] = useState<LeadStatus>('NEW');
  const [formValue, setFormValue] = useState('');
  const [formNotes, setFormNotes] = useState('');
  async function handleCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setCreateError(null);
    if (formName.trim().length === 0) {
      setCreateError('Name is required');
      return;
    }
    setCreating(true);
    try {
      const value =
        formValue.trim().length === 0 ? undefined : Number(formValue);
      if (
        formValue.trim().length > 0 &&
        Number.isNaN(value as number)
      ) {
        setCreateError('Value must be a number');
        setCreating(false);
        return;
      }
      await createLead({
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        company: formCompany.trim() || undefined,
        status: formStatus,
        value,
        notes: formNotes.trim() || undefined,
      });
      setFormName('');
      setFormEmail('');
      setFormCompany('');
      setFormStatus('NEW');
      setFormValue('');
      setFormNotes('');
      if (onSuccess !== undefined) {
        await onSuccess();
      } else {
        router.push('/leads');
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  }
  return (
    <form
      onSubmit={(e) => void handleCreate(e)}
      className="grid gap-4 md:grid-cols-2"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Name *</span>
        <input
          className="ui-input"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Email</span>
        <input
          type="email"
          className="ui-input"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Company</span>
        <input
          className="ui-input"
          value={formCompany}
          onChange={(e) => setFormCompany(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Status</span>
        <select
          className="ui-select"
          value={formStatus}
          onChange={(e) =>
            setFormStatus(e.target.value as LeadStatus)
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
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Optional"
        />
      </label>
      <label className="md:col-span-2 flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Notes</span>
        <textarea
          className="ui-textarea min-h-[72px]"
          value={formNotes}
          onChange={(e) => setFormNotes(e.target.value)}
        />
      </label>
      <div className="md:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={creating}
          className="ui-btn-primary"
        >
          {creating ? 'Creating…' : 'Create lead'}
        </button>
        {createError !== null ? (
          <span className="text-sm text-danger">{createError}</span>
        ) : null}
      </div>
    </form>
  );
}

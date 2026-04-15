'use client';

import { CreateLeadForm } from '@/components/create-lead-form';

export default function NewLeadPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">New lead</h1>
      </div>
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <CreateLeadForm />
      </section>
    </div>
  );
}

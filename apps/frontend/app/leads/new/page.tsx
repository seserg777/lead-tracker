'use client';

import { CreateLeadForm } from '@/components/create-lead-form';

export default function NewLeadPage(): React.ReactElement {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New lead
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new lead to your pipeline.
        </p>
      </div>
      <section className="ui-card">
        <CreateLeadForm />
      </section>
    </div>
  );
}

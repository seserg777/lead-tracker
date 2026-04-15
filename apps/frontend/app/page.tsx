import Link from 'next/link';

export default function Home(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="ui-card w-full max-w-xl text-center">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
          Lead Tracker
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Mini CRM — manage leads from the list or create a new one.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link href="/leads" className="ui-btn-primary sm:min-w-[140px]">
            View leads
          </Link>
          <Link href="/leads/new" className="ui-btn-secondary sm:min-w-[140px]">
            Create new lead
          </Link>
        </div>
      </div>
    </div>
  );
}

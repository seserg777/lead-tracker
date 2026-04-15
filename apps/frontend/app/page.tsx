import Link from 'next/link';

export default function Home(): React.ReactElement {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-16">
      <h1 className="mb-2 text-3xl font-semibold text-zinc-900">
        Lead Tracker
      </h1>
      <p className="mb-10 text-center text-sm text-zinc-500">
        Mini CRM — manage leads from the list or create a new one.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Link
          href="/leads"
          className="rounded bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800"
        >
          View leads
        </Link>
        <Link
          href="/leads/new"
          className="rounded bg-white px-6 py-3 text-center text-sm font-medium text-zinc-900 ring-1 ring-zinc-300 hover:bg-zinc-50"
        >
          Create new lead
        </Link>
      </div>
    </div>
  );
}

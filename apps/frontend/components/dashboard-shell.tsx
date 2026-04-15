import { DashboardSidebar } from '@/components/dashboard-sidebar';

type DashboardShellProps = {
  readonly children: React.ReactNode;
};

/**
 * Application shell: sidebar + main content column (reference TailAdmin layout).
 */
export function DashboardShell({
  children,
}: DashboardShellProps): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

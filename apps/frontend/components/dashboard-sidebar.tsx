'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  readonly href: string;
  readonly label: string;
};

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/leads', label: 'Leads' },
  { href: '/leads/new', label: 'New lead' },
] as const;

/**
 * Returns whether the nav item should show an active state for the current path.
 */
function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  if (href === '/leads/new') {
    return pathname === '/leads/new';
  }
  if (href === '/leads') {
    return pathname.startsWith('/leads') && pathname !== '/leads/new';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Dashboard sidebar with primary navigation (TailAdmin-style shell).
 */
export function DashboardSidebar(): React.ReactElement {
  const pathname = usePathname();
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:w-64 md:min-h-screen md:border-b-0 md:border-r">
      <div className="flex h-16 items-center px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Lead Tracker
        </Link>
      </div>
      <nav className="flex flex-col gap-0.5 p-3 md:flex-1" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-soft text-primary'
                  : 'text-sidebar-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { DashboardShell } from '@/components/dashboard-shell';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lead Tracker',
  description: 'Mini CRM for leads',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}

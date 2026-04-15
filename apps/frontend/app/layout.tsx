import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Lead Tracker',
  description: 'Mini CRM for leads',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-100 antialiased text-zinc-900`}
      >
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-lg font-semibold text-zinc-900">
              Lead Tracker
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/"
                className="font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
              >
                Home
              </Link>
              <Link
                href="/leads"
                className="font-medium text-blue-700 hover:underline"
              >
                Leads
              </Link>
              <Link
                href="/leads/new"
                className="font-medium text-blue-700 hover:underline"
              >
                New lead
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

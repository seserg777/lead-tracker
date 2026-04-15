import path from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.join(__dirname, '..', '.env.local') });
loadEnv({ path: path.join(__dirname, '..', '.env') });

/**
 * Resolves API base URL for direct HTTP calls in tests (e.g. seeding leads).
 * Uses PLAYWRIGHT_API_URL or NEXT_PUBLIC_API_URL from `.env.local`.
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.PLAYWRIGHT_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (raw === undefined || raw.trim().length === 0) {
    throw new Error(
      'Set NEXT_PUBLIC_API_URL or PLAYWRIGHT_API_URL in apps/frontend/.env.local',
    );
  }
  return raw.replace(/\/$/, '');
}

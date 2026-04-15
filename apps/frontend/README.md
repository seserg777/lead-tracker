This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The app listens on [http://localhost:3100](http://localhost:3100). Configure `NEXT_PUBLIC_API_URL` in `.env.local` pointing at the Nest API (e.g. `http://localhost:3101`). On localhost, prefer `http://127.0.0.1:3101` instead of `localhost` so the browser and Node resolve to IPv4; `localhost` may use `::1` while the API listens only on IPv4, which shows **Failed to fetch** and breaks e2e (`ECONNREFUSED ::1:3101`).

## E2E tests (Playwright)

Start MySQL, the backend, and this app (`npm run dev`) yourself — Playwright does not start servers. Install browsers once: `npx playwright install chromium`.

From `apps/frontend`, run `npm run test:e2e` (headless) or `npm run test:e2e:headed` to watch the browser. Each run records **video** and **screenshots** (see `test-results/` and the HTML report: `npx playwright show-report`). Optional: `PW_SLOW=300` slows actions for easier observation.

Run a single scenario: `npm run test:e2e:create` (create lead), `npm run test:e2e:filter` (search + status), `npm run test:e2e:sort` (sort/order). Use `:headed` variants (e.g. `test:e2e:create:headed`) to watch in the browser. API seeding uses `NEXT_PUBLIC_API_URL` or `PLAYWRIGHT_API_URL` in `.env.local`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

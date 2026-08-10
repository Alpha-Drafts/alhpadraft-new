# Mock Mode — Run the App Without a Backend

Mock mode lets you run the **entire frontend locally with no backend**. Instead of
calling the API, the app uses a built-in mock user and sample data so every page
renders, including the dashboard, projects, settings, and the editor.

> This is for local development and demoing the UI only. It is **never active in
> production**: the flag is gitignored (`.env.local`) and the code is compiled
> out whenever `NODE_ENV === "production"` (i.e. any `next build`).

## Prerequisites

- Node **18.18+** (Next.js 15 requirement)
- `yarn` (pinned to `yarn@1.22.22` in `package.json`)

## Setup

1. Create a local env file:

   ```bash
   echo "NEXT_PUBLIC_MOCK_AUTH=true" > .env.local
   ```

   `.env.local` is gitignored, so it won't be committed or affect anyone else.

2. Install dependencies and start the dev server:

   ```bash
   yarn install
   yarn dev
   ```

3. Open <http://localhost:3000>.

To turn mock mode off, delete `.env.local` (or remove the line) and restart the
dev server.

## What is mocked

All responses come from `utils/mock/index.ts`:

| Endpoint | Mock response |
| --- | --- |
| `GET /v1/users/me` | Mock user (`mock@alphadrafts.com`, role `subscriber`) |
| `GET /v2/projects` / `GET /v1/projects` | 5 sample projects |
| `GET /v2/projects/:id` / `GET /v1/projects/:id` | A sample project |
| `GET /v1/payments/subscription` | Free plan, 2 of 3 checks used |
| `GET /v1/credits/balance` | 2,500 available credits |
| `GET /v1/credits/history` | 2 sample transactions |
| `GET /v1/users/subscription-history` | 1 sample allocation |
| `GET /v1/users/statistics` | Sample account stats |
| `GET /v1/payments/plans` | Free / Pay-Per-Check / Subscription |
| `GET /v1/users/notifications/notifications-count` | 0 unread |
| Anything else | Generic `success` (no-op) |

## Test procedure flow

Use this checklist to verify the UI end-to-end. Everything below should work
without a backend.

1. **Landing page** — `GET /`
   - Pricing, features, and FAQ sections render.
   - No auth wall — the page loads immediately.

2. **Auth pages** — `GET /?auth=login`, `/?auth=signup`, `/?auth=forgot-password`
   - Login, signup, and forgot-password forms render.
   - (Submitting succeeds silently — there is no real auth in mock mode.)

3. **Dashboard** — `GET /dashboard`
   - Shows "Welcome back, Mock User!".
   - **Recent Projects** lists sample projects.
   - NavBar shows the mock user's email and a credit/checks badge
     ("1 check left" on the free plan).

4. **All Projects** — `GET /dashboard/projects`
   - Project cards populate from sample data.
   - Search box filters by name/description/type.
   - Sort dropdown switches between `createdAt`, `updatedAt`, `dueDate`.
   - Pagination renders (5 projects, no paging needed).

5. **Settings** — `GET /dashboard/settings`
   - Account tab shows sample statistics.
   - Billing tab shows the current plan and credit balance.
   - Credit history and subscription history tables populate with sample rows.

6. **Editor** — `GET /dashboard/projects/draft/mock-project-1`
   - Editor loads the sample project's content.
   - The check-selection modal opens and lists the available checks.

7. **New project flow** — `GET /dashboard/projects/new/mock-project-1`
   - The upload → analyse → submit steps render.
   - Uploading a file and running checks are **no-ops** (no real analysis).

8. **Static pages** — `GET /privacy`, `GET /terms`, `GET /unauthorised`
   - All render normally.

9. **Responsive** — Resize to mobile width.
   - NavBar collapses to the mobile menu with the same links and user info.

## What is NOT covered

- Real AI originality / plagiarism / alignment checks (they need Sapling/Winston).
- Credit deduction, refunds, and subscription checkout (Stripe).
- Creating, saving, or deleting projects against a database.
- Email verification and password reset emails.
- Sign out — mock mode keeps the mock user logged in.

These flows show a "success" toast or no-op instead of doing real work, so you
can still preview the UI without errors.

# Frontend Impact Analysis — Backend `firebase-decopling` branch

> Analysis of `~/Desktop/project/alpha-drafts-backend` branch `firebase-decopling`
> (base: `main` @ `194ec12d`) against the frontend repo `alphadrafts-DocAuditor`.
> The frontend's own `firebase-decouplng` branch is currently identical to `dev` — **no frontend decoupling work exists yet**.

---

## 1. What the backend branch actually changed

The branch is a full Firebase → Postgres/R2/JWT migration (159 files, +24.2k/−15.3k):

| Area              | Before (main)                                                                 | After (firebase-decopling)                                                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth              | Firebase ID token verified via `FirebaseAuthGuard` (`firebase-auth.guard.ts`) | JWT access token (15 min) + refresh token (30 d) in **httpOnly cookies**, CSRF double-submit guard. `JwtAuthGuard` reads **only** the `access_token` cookie — no Bearer support (`src/auth/jwt-auth.guard.ts`) |
| Auth endpoints    | Only `POST /v1/auth/signup` existed                                           | `POST /v1/auth/signup` `.login` `.refresh` `.logout`, `GET /v1/auth/csrf-token` (`src/auth/auth.controller.ts`)                                                                                                |
| DB                | Firestore (Firebase Admin)                                                    | Postgres via Drizzle ORM, `drizzle/` migrations                                                                                                                                                                |
| Storage           | Firebase Storage                                                              | Cloudflare R2, private bucket, **presigned URLs** (`src/storage/r2-storage.service.ts`)                                                                                                                        |
| New modules       | —                                                                             | `posts` (`/v1/projects/:id/posts`), `projects-v2` (`/v2/projects`), async `grading` pipeline (BullMQ + Redis), `storage` port                                                                                  |
| Removed           | `firebase-admin`, all `*.firebase.ts` adapters, `firebase-auth.guard.ts`      | —                                                                                                                                                                                                              |
| Response envelope | `{status, message, data}` (ResponseInterceptor existed on main)               | Unchanged — already present on `main`                                                                                                                                                                          |
| Validation        | Whitelist validation                                                          | `whitelist + forbidNonWhitelisted` — **unknown fields now 400**                                                                                                                                                |
| New env vars      | —                                                                             | `DATABASE_URL`, `JWT_*`, `CSRF_SECRET`, `REDIS_*`, `R2_*`, `STRIPE_*`, `SENTRY_DSN`, `FRONTEND_URL`                                                                                                            |

---

## 2. Summary of impact

The frontend's **entire auth/session layer** (Firebase client SDK + Firebase Admin in Next.js API routes/middleware) stops working, and **several API endpoints the frontend already calls do not exist** on the decoupled backend. The response envelope and most business endpoints (credits, payments checkout, v2 project editor flows) are compatible.

---

## 3. What breaks — detailed

### 3.1 Auth & session (P0 blocker)

| Frontend file                                                                                                                                  | Current Firebase behavior                                                                                         | Required change                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/auth/useLogin.ts`                                                                                                                       | `signInWithEmailAndPassword` + Firestore cookie-consent writes                                                    | `POST /v1/auth/login` (fetch CSRF first, send `X-CSRF-Token`); drop Firestore writes                                                                                                                                                                                                                        |
| `hooks/auth/useSignup.ts`                                                                                                                      | `createUserWithEmailAndPassword` + Firestore user doc + `POST /api/v1/auth/create-role` + `sendEmailVerification` | `POST /v1/auth/signup` (`{fullName, email, password}`); roles default `['user']` in Postgres; **no email verification on backend**                                                                                                                                                                          |
| `hooks/auth/useSignOutUser.ts`                                                                                                                 | `auth.signOut()`                                                                                                  | `POST /v1/auth/logout`                                                                                                                                                                                                                                                                                      |
| `context/AuthProvider.tsx`                                                                                                                     | `onAuthStateChanged` → React `User`                                                                               | Replace with session check (e.g. `GET /v1/users/me` succeeds ⇒ authed)                                                                                                                                                                                                                                      |
| `context/ClaimsContext.tsx`                                                                                                                    | Reads roles from Firebase ID-token claims (`getIdTokenResult`)                                                    | **Roles are now in an httpOnly JWT the browser cannot decode.** Need backend to expose roles — `GET /v1/users/me` currently returns `{id, fullName, email, created_at, updated_at}` **without roles** (`toUser` in `users.service.ts`). Either add `roles` to that response or add a `/v1/auth/me` endpoint |
| `hooks/auth/useAuthGuard.ts`                                                                                                                   | Route guard on Firebase user + claims                                                                             | Guard on cookie session + roles from new source                                                                                                                                                                                                                                                             |
| `utils/auth/refreshToken.ts`, `utils/api/apiClient.ts`                                                                                         | `getIdToken()` + Bearer header + retry on `auth/id-token-expired`                                                 | Cookie-based session; axios **`withCredentials: true`**; on 401 call `POST /v1/auth/refresh`; **no Bearer header anywhere**; remove `auth/id-token-expired` logic                                                                                                                                           |
| `pages/auth/index.tsx` (verifyEmail + resetPassword oobCode handling), `common/others/EmaiVerificationBanner.tsx`                              | Firebase `applyActionCode`                                                                                        | No backend equivalent — needs new backend endpoints or removal                                                                                                                                                                                                                                              |
| Password reset: `pages/api/v1/auth/forgot-password.ts`, `reset-password.ts`, `components/auth/ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx` | Firebase `sendPasswordResetEmail` / `confirmPasswordReset`                                                        | **Backend has no password-reset endpoints** — must be added (email flow) or kept on Firebase                                                                                                                                                                                                                |

### 3.2 Next.js API routes & middleware using Firebase Admin (P0)

All of these must be removed or rewritten — `firebase-admin` is gone:

- `pages/api/v1/auth/create-role.ts` — `adminAuth.setCustomUserClaims` → **delete** (roles now set in Postgres at signup; no `create-role` endpoint on backend)
- `pages/api/v1/settings/update-profile.ts` — same custom-claims call → **delete**
- `middleware/authMiddleware.ts`, `middleware/roleMiddleware.ts` — `adminAuth.verifyIdToken` → **delete** (only used by `_example` routes; real routes hit the backend directly). If server-side auth is ever needed in Next routes, verify the `access_token` cookie with `jose` + `JWT_SECRET`
- `firebaseAdmin.ts` — **delete**
- `firebase.ts` — keep only until storage/auth migration done, then delete

### 3.3 Endpoints the frontend calls that are MISSING on the decoupled backend

| Frontend call                                                                               | File(s)                                                                              | Status on backend                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /v2/projects` (create project)                                                        | `components/dashboard/overview/CreateProjectModal.tsx`                               | **Does not exist** — v2 controller has `save`, `save/file`, GET, PUT, evaluate, ai-detection, plagiarism-check, DELETE only. Use `POST /v1/projects` with `CreateProjectDto` (`type, name, description, dueDate`). Drop the extra `content: ""` field |
| `PUT /v1/projects/:id` with `{stage: 3}`                                                    | `CreateProjectModal.tsx:162`                                                         | `stage` not in `UpdateProjectDto` (`name/content/instructionText`) → **400** due to `forbidNonWhitelisted`                                                                                                                                            |
| `POST /v1/projects/:id/instructions/analyze` with `{textContent, purpose}`                  | `components/dashboard/project-create/upload/UploadForm.tsx:300`                      | `purpose` not in `UploadInstructionDto` → **400**. Send `{textContent}` only                                                                                                                                                                          |
| `POST /v1/projects/:projectId/posts/file` (XHR + `Authorization: Bearer`)                   | `components/dashboard/overview/VerificationStart.tsx:345`                            | **Not on backend** — posts controller has text/plain `POST` only; no `/file` route. Rework to posts `POST` (text) or add backend route                                                                                                                |
| `POST /v1/payments/assign-free-plan`                                                        | `components/dashboard/GatePricing.tsx:129`, `components/public/home/Pricing.tsx:134` | **Not on backend** (neither old nor new). Needs backend endpoint or flow change                                                                                                                                                                       |
| `GET /v1/users/notifications/notifications-count`, `POST /v1/users/notifications/mark-read` | `context/NotificationContext.tsx`, `hooks/misc/useMarkNotificationAsRead.ts`         | **Not on backend**. Decide: implement notifications in Postgres or drop the feature                                                                                                                                                                   |
| XHR uploads with `Authorization: Bearer ${token}`                                           | `VerificationStart.tsx` (instructions/file + posts/file)                             | Bearer no longer accepted — rely on cookies (`withCredentials`)                                                                                                                                                                                       |

### 3.4 Data-contract mismatches (P1)

- **User shape**: backend `User` = `{id, fullName, email, created_at, updated_at}` (ISO strings). Frontend `UserProps` (`types/users.ts`) expects `name`, `user_id`, `roles`, `photo_url`, `subscription`, `credits`, `avatar`, `bio`, Firestore `Timestamp` dates. Components read `user.name`, `user.avatar`, `user.credits.*`, etc. → **must be mapped** (`fullName` ↔ `name`, roles/credits/subscription moved to dedicated endpoints: `/v1/credits/balance`, `/v1/payments/subscription`).
- **Timestamps**: `utils/formatting/formatDates.ts` is Firestore-`Timestamp`-based and imports `firebase/firestore` → rewrite for ISO/Date.
- **Types**: `types/users.ts`, `types/apis.ts`, `types/notifications.ts` import `firebase/firestore` → drop Firebase types.
- **Compatible (verified)**: `{status,message,data}` envelope (`useFetchHook` already unwraps `data`); `credits/balance` → `{available, used, monthlyAllocation, lastUpdated}` (matches `useCreditBalance`); `payments/checkout` → `{url, transactionId}` (matches `BuyCreditsModal`); `v1`/`v2` project list pagination `{data, totalCount, skip, take, hasMore}` (matches `useProjects`); `credits/deduct|validate|refund` DTOs (`features: AI_ONLY|ALIGNMENT_ONLY|PLAGIARISM_ONLY`, `wordCount`, `project`) match `utils/credits/*`.

### 3.5 Other gaps (P2)

- **Payment success/cancel pages**: backend checkout redirects to `${FRONTEND_URL}/payment/success` and `/payment/cancel` — the frontend has **no `/payment/*` pages** → 404 after Stripe checkout.
- **Cookie consent**: written to Firestore in `useLogin`/`useSignup` — no backend equivalent → migrate to `localStorage` or drop.
- **`next.config.ts`**: `images.domains` includes `firebasestorage.googleapis.com` → replace with R2 presigned URL pattern (`remotePatterns` for `*.r2.cloudflarestorage.com` or `R2_PUBLIC_URL`).
- **CI** (`.github/workflows/deploy.yml`): Firebase env vars (`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_KEYS`) become obsolete; add `NEXT_PUBLIC_*` backend URL env and any cookie-domain config (cookies are `sameSite=lax`, `secure` in prod — frontend must be served over HTTPS on the `CORS_ORIGINS` domain).
- **`API_BASE_URL`** (`constants/auth.ts`) still points at Cloud Run — fine, but confirm dev/staging URLs remain the decoupled deployment.
- **Sapling/Winston proxies** (`pages/api/v1/sapling/*`, `pages/api/v1/winston/*`) — server-side key proxies, no Firebase dependency → **no change**.

---

## 4. Prioritized work plan for the frontend

### P0 — Blocking (app cannot auth or create projects)

1. New auth client: `login`/`signup`/`logout`/`refresh`/`csrf-token` against `/v1/auth/*`; CSRF fetch + `X-CSRF-Token` header on mutations.
2. `apiClient`: `withCredentials: true`, remove Bearer interceptor + `auth/id-token-expired` retry; on 401 → `POST /v1/auth/refresh` once, else redirect to login.
3. Rework `AuthProvider`/`ClaimsContext`/`useAuthGuard`/`DashboardContext` to session-based auth; source roles from backend (add `roles` to `GET /v1/users/me` — **backend change needed**).
4. Delete Firebase-Admin API routes + middleware (`create-role`, `update-profile`, `authMiddleware`, `roleMiddleware`, `firebaseAdmin.ts`).
5. Fix `CreateProjectModal` → `POST /v1/projects`; remove `stage` update; fix `instructions/analyze` payload (drop `purpose`).
6. Rework `VerificationStart` uploads (no Bearer, no `/posts/file`) — align with backend posts API.
7. `assign-free-plan`, notifications, password-reset/email-verification: raise as backend gaps (or drop features).

### P1 — Correctness

8. User shape mapping (`fullName` vs `name`, roles/credits/subscription from dedicated endpoints); rewrite `formatDates`; clean Firebase types.
9. Add `/payment/success` + `/payment/cancel` pages (consume `session_id`/`transactionId`).
10. Update `next.config.ts` image remotePatterns for R2 presigned URLs.

### P2 — Cleanup

11. Cookie-consent storage migration (localStorage); remove `firebase`/`firebase-admin`/`react-firebase-hooks` deps; delete `firebase.ts`; update CI env vars and `.env.local.example`.

---

## 6. Frontend implementation status (this branch)

> Work performed on the frontend `firebase-decouplng` branch. Verified with
> `yarn check-types` (tsc), `yarn lint`, and a production `yarn build` — all green.

### Done (P0/P1/P2 frontend)

- **Auth**: new `utils/auth/` module (`authApi.ts` login/signup/logout, `session.ts` CSRF, `csrf.ts` cookie helpers, `serverSession.ts` HS256 JWT verifier for Next API routes). `useLogin`/`useSignup`/`useSignOutUser` rewritten for `POST /v1/auth/*`.
- **apiClient** (`utils/api/apiClient.ts`): `withCredentials: true`, no Bearer token, CSRF header echo on unsafe methods, silent 401 → `/v1/auth/refresh` retry (no hard redirect).
- **Session contexts**: `AuthProvider` derives session from `GET /v1/users/me`; `ClaimsContext` exposes roles/claims/token from the session (kept the old interface so guards keep working); `useCurrentUser`/`useGetUser`/`useAuthGuard` adapted; `useCurrentSubscription` now reads `GET /v1/payments/subscription`.
- **Deleted Firebase-Admin layer**: `firebaseAdmin.ts`, `middleware/authMiddleware.ts`, `middleware/roleMiddleware.ts`, `pages/api/v1/auth/create-role.ts`, `forgot/reset-password.ts`, `settings/update-profile.ts`, `_example/*`. Sapling/Winston API routes now verify the session cookie with the server-side JWT verifier.
- **Endpoint fixes**: `CreateProjectModal` → `POST /v1/projects` (stage update removed); `UploadForm` drops `purpose`; `VerificationStart` XHRs use cookies; `credit-refund`/`Accounts` drop the Bearer header; `Accounts` sends `name` field.
- **Data contract**: `useGetUser` maps `/v1/users/me` → `UserProps` (`fullName`→`name`); `types/*` and `formatDates`/`formatIOSDates` no longer depend on Firebase `Timestamp`.
- **New pages**: `/payment/success`, `/payment/cancel` (backend redirect targets).
- **Config**: `next.config.ts` image allowlist for R2 presigned URLs; `.env.local.example` + GitHub workflows updated (Firebase vars removed, `JWT_SECRET`/`R2_PUBLIC_URL` added).
- **Deps**: removed `firebase`, `firebase-admin`, `react-firebase-hooks`; deleted `firebase.ts`.

### Remaining — BACKEND work required (firebase-decopling branch)

The following were deliberately wired to backend endpoints that do not exist yet
(decision: add them on the backend):

1. `GET /v1/users/me` must return `roles` (and optionally `bio`, `avatarStoragePath` — already in the repo record, just not exposed by `toUser`).
2. `POST /v1/auth/forgot-password`, `POST /v1/auth/reset-password`, `POST /v1/auth/verify-email`, `POST /v1/auth/send-verification-email` (email flows).
3. `GET /v1/users/notifications/notifications-count`, `POST /v1/users/notifications/mark-read`.
4. `POST /v1/payments/assign-free-plan` (GatePricing/Pricing call it).
5. `POST /v1/projects/:projectId/posts/file` (VerificationStart work-file upload).
6. Implement the TODO stubs: `GET /v1/payments/subscription`, `POST /v1/payments/cancel`, `POST /v1/payments/change-plan`.

### Remaining — frontend polish

- Cookie consent: Firestore writes removed; the vanilla-cookieconsent cookie persists preferences client-side (consider server-side storage later).
- Notifications UI will show 0/empty until the backend endpoints land.
- Email verification: `EmailVerificationBanner` and `/auth` verify flow are wired to the new endpoints; banner shows until backend implements verification.
- `JWT_SECRET` must be added as a GitHub Actions secret and to the hosting env.

---

## 5. Verification checklist (manual QA after migration)

- [ ] Signup → auto-login → dashboard renders with correct name + default `user` role
- [ ] Login/logout/refresh survives page reloads and >15 min idle (access-token rotation)
- [ ] Admin/super-admin role gating works (roles from backend)
- [ ] Create project (text) and create-from-Grammar/Citation (no stage-400)
- [ ] Instruction file upload + instruction text analyze (no `purpose` 400)
- [ ] Editor: ai-detection, plagiarism-check, evaluate on `/v2/projects/*` still return updated project
- [ ] Credits: balance, deduct, refund, validate flows
- [ ] Payments: checkout → Stripe → `/payment/success`; cancel; subscription status
- [ ] Profile update with avatar (multipart) + password change
- [ ] Notifications (if kept) / password reset / email verification (if backend added)

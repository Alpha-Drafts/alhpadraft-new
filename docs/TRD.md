# Technical Requirements Document (TRD)

## 1. Project Overview & Scope
- **Product Name:** AlphaDraft Web Application
- **Repository:** `alphadraft-new`
- **Primary Objective:** Provide a fast, responsive, and secure writing assistant for students, researchers, and professional writers with real-time editing, assignment rubric evaluation, AI probability scoring, and citation generation.

---

## 2. Technical Stack & Environment

| Component | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (Pages Router) | `15.4.10` | High-performance SSR, established route structure, unified API rewrites. |
| **Core UI Engine** | React | `19.0.0` | Latest React runtime with optimized rendering transitions. |
| **Styling & Design System** | Tailwind CSS / PostCSS | `v4.0.0` | Material 3 tonal surface tokens, dynamic dark mode, no build-time purge delays. |
| **Editor Runtime** | TipTap / ProseMirror | `v3.20.4` | Headless, highly extensible rich text document model supporting custom inline marks. |
| **State & Cache** | TanStack React Query | `v5.90.21` | Query caching, deduplicated network fetches, automatic background revalidation. |
| **HTTP Client** | Axios | `v1.12.0` | Interceptor support for automated CSRF injection and silent cookie rotation. |
| **Date Processing** | Date-fns | `v4.1.0` | Tree-shakeable date formatting utilities. |
| **Testing** | Playwright Test | `v1.62.1` | End-to-end browser automation and flow validation. |

---

## 3. Non-Functional Requirements (NFR)

### 3.1 Security & Compliance
- **Session Tokens:** No sensitive authentication tokens stored in `localStorage` or `sessionStorage`. All tokens must be isolated in `httpOnly`, `Secure`, `SameSite=Lax` cookies.
- **Cross-Site Request Forgery (CSRF):** All non-idempotent HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) require an `X-CSRF-Token` header matching the readable `csrf_token` cookie.
- **Third-Party Credential Protection:** Zero client exposure of third-party keys (`WINSTON_API_KEY_*`, `SAPLING_API_KEY_*`, `SENDER_API_TOKEN`). All external AI API requests must route through authenticated Next.js proxy endpoints.
- **Input Sanitization & Injection Defense:** Rich-text HTML content sanitized before DOM injection and DOCX generation to prevent XSS.

### 3.2 Performance & Responsiveness
- **Largest Contentful Paint (LCP):** Under 2.0 seconds on standard broadband connections.
- **Interaction to Next Paint (INP):** Under 200 milliseconds during intense typing inside the TipTap editor.
- **Auto-Save Optimization:** Editor sync requests throttled/debounced to a minimum of 1,500ms intervals to prevent server request flooding.

### 3.3 Reliability & Fault Tolerance
- **Transient Session Expiry:** Transparent, automated token refresh via `POST /v1/auth/refresh` without prompting the user or losing unsaved editor input.
- **Local Fallback Snapshots:** Editor persists the 5 most recent versions in browser session memory to prevent content loss in case of network drops.

---

## 4. API Endpoints & Contract Matrix

### 4.1 Internal Next.js Proxies (`/api/v1/*`)
| Route | Method | Auth Required | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/sapling/[...path]` | `POST` | Yes (`access_token`) | Proxies grammar, tone, and text check to Sapling AI API. |
| `/api/v1/sapling/aidetect` | `POST` | Yes (`access_token`) | Proxies text classification to Sapling AI detector. |
| `/api/v1/winston/ai-detection` | `POST` | Yes (`access_token`) | Proxies text analysis to Winston.ai detection API. |
| `/api/v1/winston/plagiarism` | `POST` | Yes (`access_token`) | Dispatches plagiarism scans to Winston.ai. |
| `/api/v1/mail-list` | `POST` | No | Subscribes lead emails to Sender.net mailing list. |

### 4.2 Decoupled Backend Endpoints (Proxied via `/v1/*` & `/v2/*`)
| Route | Method | Purpose |
| :--- | :--- | :--- |
| `/v1/auth/login` | `POST` | Authenticates credentials, issues session cookies. |
| `/v1/auth/signup` | `POST` | Registers account in PostgreSQL. |
| `/v1/auth/refresh` | `POST` | Rotates expired access token using valid refresh cookie. |
| `/v1/auth/logout` | `POST` | Revokes and clears authentication cookies. |
| `/v1/users/me` | `GET` | Fetches authenticated user profile and roles. |
| `/v1/projects` | `GET`, `POST` | Project catalog and v1 creation flow. |
| `/v2/projects/:id` | `GET`, `PUT`, `DELETE` | TipTap v2 document retrieval, auto-save, and deletion. |
| `/v1/credits/balance` | `GET` | Returns available, used, and allocated monthly credits. |
| `/v1/credits/deduct` | `POST` | Deducts credits prior to running premium scans. |
| `/v1/payments/checkout` | `POST` | Generates Stripe checkout session for credit top-ups or plans. |

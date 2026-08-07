export const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

const PROD_API_URL =
  "https://alpha-drafts-backend-635966690380.us-east1.run.app";
const DEV_API_URL =
  "https://alpha-drafts-backend-dev-635966690380.us-east1.run.app";

/**
 * Backend base URL. Prefers the per-environment URL from env vars
 * (NEXT_PUBLIC_*_URL) when set — useful for local development against a local
 * backend — and falls back to the deployed Cloud Run URLs.
 */
export const API_BASE_URL = isProduction
  ? process.env.NEXT_PUBLIC_PRODUCTION_URL || PROD_API_URL
  : process.env.NEXT_PUBLIC_LOCAL_URL ||
    process.env.NEXT_PUBLIC_DEVELOPMENT_URL ||
    process.env.NEXT_PUBLIC_STAGING_URL ||
    DEV_API_URL;

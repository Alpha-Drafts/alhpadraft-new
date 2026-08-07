/**
 * Date/timestamp types used across the app. The decoupled backend returns
 * ISO date strings; legacy Firestore-style timestamp objects
 * (`{ seconds, nanoseconds }` / `{ _seconds }` / `{ toDate() }`) are still
 * accepted by the formatters for compatibility with cached data.
 */

export interface TimestampLike {
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;
  _nanoseconds?: number;
  toDate?: () => Date;
}

export type ApiTimestamp = string | Date | TimestampLike | null | undefined;

/**
 * Utility functions for formatting dates and timestamps into readable strings.
 * Accepts ISO strings (decoupled backend), Date objects, or legacy
 * Firestore-style timestamp objects (`{ seconds, nanoseconds }` /
 * `{ _seconds, ... }` / `{ toDate() }`).
 */

import { format } from "date-fns";
import { TimestampLike } from "@/types/dates";

// Converts any supported timestamp representation to a Date
const toDate = (timestamp: string | Date | TimestampLike): Date | null => {
  if (!timestamp) return null;

  if (typeof timestamp === "string") {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }

  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? null : timestamp;
  }

  if (typeof timestamp === "object") {
    const obj = timestamp as TimestampLike;
    // Firestore Timestamp-like
    if (typeof obj.seconds === "number") {
      return new Date(obj.seconds * 1000);
    }
    // Admin Timestamp-like
    if (typeof obj._seconds === "number") {
      return new Date(obj._seconds * 1000);
    }
    // Object with toDate()
    if (typeof obj.toDate === "function") {
      const d = obj.toDate();
      return isNaN(d.getTime()) ? null : d;
    }
  }

  return null;
};

// Converts a timestamp to a formatted date string (e.g., "22nd Jun, 2023")
export const formatTimestampToDate = (
  timestampObj: string | Date | TimestampLike,
): string => {
  const timestamp = toDate(timestampObj);
  return timestamp ? format(timestamp, "do MMM',' yyyy") : "";
};

// Converts a timestamp to a formatted time string (e.g., "12:12 AM")
export const formatTimestampToTime = (
  timestampObj: string | Date | TimestampLike,
): string => {
  const timestamp = toDate(timestampObj);
  return timestamp ? format(timestamp, "hh:mm a") : "";
};

// Converts a timestamp to a formatted date and time string (e.g., "22nd Jun, 2023, 12:12 AM")
export const formatTimestampToDateAndTime = (
  timestampObj: string | Date | TimestampLike,
): string => {
  const timestamp = toDate(timestampObj);
  return timestamp ? format(timestamp, "do MMM',' yyyy, hh:mm a") : "";
};

// Returns the number of years between the given timestamp and now as a string
export const formatTimestampToRelativeYear = (
  timestampObj: string | Date | TimestampLike,
): string => {
  const timestamp = toDate(timestampObj);
  if (!timestamp) return "";

  const now = new Date();
  const secondsDiff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  const minutes = Math.floor(secondsDiff / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  return `${years}`;
};

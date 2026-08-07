/**
 * Utility functions for formatting and normalizing error objects from various sources
 * (Axios, Firebase, generic JS errors) into user-friendly error messages.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { errors } from "@/constants";

// Formats Firebase Authentication error codes into user-friendly messages.
export const getFirebaseError = (code: string, fallback?: string) => {
  // Remove the "auth/" prefix from the error code
  const getKey = code.replace("auth/", "");

  // Check if the errorName is found in errors
  const errorMessage = getKey ? errors[getKey] : null;

  // Return the error message if found, otherwise a initial message
  return errorMessage || fallback || "Unknown Firebase error";
};

// Formats an error object into a user-friendly message.
export const formatError = (err: any, fallback?: string) => {
  let error = "";

  if (axios.isAxiosError(err)) {
    // Handle backend error responses with structure: { message, error, statusCode }
    const data = err.response?.data;
    if (data) {
      // Try to extract message from various backend error formats
      error = data?.message || data?.error || data?.msg;
    }
    // Fallback to axios error message
    if (!error) {
      error = err.message;
    }
  } else if (err?.name === "FirebaseError") {
    if (err?.code?.startsWith("auth/")) {
      error = getFirebaseError(err?.code);
    } else {
      error = err?.message;
    }
  } else if (err instanceof Error) {
    error = err?.message;
  } else if (typeof err === "string") {
    error = err;
  } else {
    error = fallback || "An unknown error occurred";
  }

  return error || fallback || "An unknown error occurred";
};

// Used only for auth errors
export const formatAuthError = (error: any, fallback?: string) => {
  const err = error?.response?.data?.error || error;
  let formattedError = "";

  if (err?.name === "FirebaseError") {
    if (err?.code?.startsWith("auth/")) {
      formattedError = getFirebaseError(err?.code);
    } else {
      formattedError = err?.message;
    }
  } else if (err instanceof Error) {
    formattedError = err?.message;
  } else if (typeof err === "string") {
    formattedError = err;
  } else {
    formattedError = fallback || "An unknown error occurred";
  }
  return formattedError;
};

/** Shape of response.data when error has response (e.g. Axios) */
interface ErrorResponseData {
  message?: string;
  msg?: string;
  error?: string;
  statusCode?: number;
}

/** Result for API route error handling (message + status code) */
export interface ApiErrorResult {
  message: string;
  statusCode: number;
}

/** Extract a user-facing message and HTTP status from an unknown catch argument (e.g. Axios). */
export const getApiErrorMessage = (
  err: unknown,
  fallback: string,
): ApiErrorResult => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ErrorResponseData | undefined;
    // Handle backend error format: { message, error, statusCode }
    const message =
      data?.message ?? data?.error ?? data?.msg ?? err.message ?? fallback;
    const statusCode = err.response?.status ?? data?.statusCode ?? 500;
    return { message, statusCode };
  }
  if (err instanceof Error) {
    return { message: err.message, statusCode: 500 };
  }
  return { message: fallback, statusCode: 500 };
};

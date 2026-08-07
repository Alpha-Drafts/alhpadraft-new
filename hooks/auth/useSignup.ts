// This file provides a custom React hook for handling user signup via the
// backend (`POST /v1/auth/signup`). The backend creates the Postgres user
// (default role "user"), hashes the password, and sets session cookies.
// Email verification and role assignment are backend concerns going forward.

import { useState } from "react";
import { formatError } from "@/utils";
import { signupUser } from "@/utils/auth";
import { UserRoleType } from "@/types";
import { useClaims } from "@/context";

// Custom React hook to handle user signup with the backend session API.
// Returns the signup function, error message, processing state, and success indicator.
export const useSignup = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { refreshClaims } = useClaims();

  // Attempts to sign up a user with name, email, and password.
  const signup = async (
    name: string,
    email: string,
    password: string,
    _role?: UserRoleType,
  ) => {
    setError("");
    setIsProcessing(true);
    setIsSuccess(false);

    try {
      await signupUser({ fullName: name, email, password });

      // Session cookies are now set — refresh claims/roles from the backend
      try {
        await refreshClaims();
      } catch (refreshError) {
        console.error("Error refreshing claims after signup:", refreshError);
      }

      // Let the UI handle redirections instead of doing it here
      setIsSuccess(true);
    } catch (signupError) {
      setError(
        formatError(
          signupError,
          "An error occurred while creating user account",
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Returns the signup function, error message, processing state, and success indicator.
  return { signup, error, isProcessing, isSuccess };
};

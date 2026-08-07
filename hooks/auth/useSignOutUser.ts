// This file provides a custom React hook for signing out the current user
// via the backend session API (`POST /v1/auth/logout`).

import { logoutUser } from "@/utils/auth";
import { formatError } from "../../utils/formatting";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { useClaims } from "@/context";

// Custom React hook to sign out the current user from the backend session.
export const useSignOutUser = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshClaims } = useClaims();

  const signOutUser = async () => {
    try {
      await logoutUser();
      // Re-check the session so AuthProvider state flips to signed-out
      await refreshClaims();
      queryClient.clear(); // Clear all React Query cache
      router.push("/"); // Redirect to home page after sign out
    } catch (error) {
      // Show error toast if sign-out fails.
      toast.error(formatError(error, "Failed to sign out user"));
    }
  };

  // Returns the signOutUser function.
  return { signOutUser };
};

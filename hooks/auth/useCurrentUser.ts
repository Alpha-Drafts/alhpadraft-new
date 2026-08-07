// Custom React hook to access the current session user (cookie-based auth).
// Returns the session user with Firebase-compatible display fields
// (`displayName`, `email`) so existing components keep working.

import { useAuth } from "@/context";

export const useCurrentUser = () => {
  const { user, loading } = useAuth();

  const currentUser = user
    ? {
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.fullName || null,
      }
    : null;

  return { currentUser, loading };
};

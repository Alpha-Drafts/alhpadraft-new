import { UserProps } from "@/types";
import { useClaims } from "@/context";
import { useFetchHook } from "../misc/useFetchHook";
import { API_BASE_URL } from "@/constants";

/**
 * Maps the decoupled backend's user payload (`GET /v1/users/me` →
 * `{ id, fullName, email, roles?, bio?, avatarStoragePath?, created_at, updated_at }`)
 * into the frontend's `UserProps` shape (`name`, `avatar`, ...) so existing
 * consumers keep working. Fields the backend does not expose (subscription,
 * credits, ...) stay undefined — the app should read those from the dedicated
 * endpoints (`/v1/payments/subscription`, `/v1/credits/balance`).
 */
export const mapMeToUserProps = (me: unknown): UserProps | null => {
  if (!me || typeof me !== "object") return null;
  const raw = me as Record<string, unknown>;
  const id = (raw.id as string) || (raw.uid as string) || "";
  if (!id) return null;

  const fullName = (raw.fullName as string) ?? (raw.name as string) ?? "";
  const created = raw.created_at ?? raw.createdAt;
  const updated = raw.updated_at ?? raw.updatedAt;

  return {
    id,
    user_id: id,
    name: fullName,
    email: (raw.email as string) ?? "",
    phone_number: (raw.phone_number as string) ?? "",
    photo_url: "",
    avatar: (raw.avatarStoragePath as string) || undefined,
    bio: (raw.bio as string) || undefined,
    roles: (Array.isArray(raw.roles) ? raw.roles : []) as UserProps["roles"],
    accepted_conditions: true,
    created_at: created as UserProps["created_at"],
    updated_at: updated as UserProps["updated_at"],
  };
};

export function useGetUser() {
  const { token } = useClaims();

  // Fetch user's detail
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useFetchHook<unknown>({
    endpoint: `${API_BASE_URL}/v1/users/me`,
    enabled: !!token,
  });

  return {
    data: mapMeToUserProps(user) as UserProps | null,
    isLoading,
    error,
    refetch,
  };
}

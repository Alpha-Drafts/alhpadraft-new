import { UserRoleType } from "@/types";
import { userRoutes } from "./routes";

export const USER_ROLES = ["user"] as const;

export const USER_STATUSES = ["active", "disabled", "banned"] as const;

// Default route paths for each user role
export const DEFAULT_ROUTE_PATH_ON_LOGIN: Record<UserRoleType, string> = {
  user: userRoutes?.dashboard,
};

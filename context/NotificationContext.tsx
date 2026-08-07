import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { NotificationCountProps } from "@/types";
import { useFetchHook } from "@/hooks";
import { useClaims, useDashboard } from "@/context";
import { apiClient } from "@/utils";
import { API_BASE_URL } from "@/constants";

interface NotificationContextType {
  unreadCount: number;
  isLoading: boolean;
  refetchCount: () => void;
  markNotificationsAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const { token } = useClaims();
  const { activeDashboard } = useDashboard();

  const {
    data: notificationCount,
    refetch: refetchCount,
    isLoading,
  } = useFetchHook<NotificationCountProps>({
    endpoint: `${API_BASE_URL}/v1/users/notifications/notifications-count`,
    enabled: !!token && !!activeDashboard, // Only fetch when we have both token and dashboard context
  });

  const markNotificationsAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/v1/users/notifications/mark-read`,
        {},
      );

      if (response?.data?.status === "success") {
        // Refetch the count after marking as read
        refetchCount();
      }

      return response?.data;
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      throw error;
    }
  }, [token, refetchCount]);

  const value: NotificationContextType = {
    unreadCount: notificationCount?.unread_count ?? 0,
    isLoading,
    refetchCount,
    markNotificationsAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

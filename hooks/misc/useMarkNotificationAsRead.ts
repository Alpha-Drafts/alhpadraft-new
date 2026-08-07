import { useCallback } from "react";
import { useClaims } from "@/context";
import { apiClient } from "@/utils";
import { API_BASE_URL } from "@/constants";

export const useMarkNotificationAsRead = () => {
  const { token } = useClaims();

  const markAsRead = useCallback(
    async (onSuccess?: () => void) => {
      if (!token) return;

      const response = await apiClient.post(
        `${API_BASE_URL}/v1/users/notifications/mark-read`,
        {},
      );

      if (response?.data?.status === "success" && onSuccess) {
        onSuccess();
      }

      return response?.data;
    },
    [token],
  );

  return { markAsRead };
};

import { useState } from "react";
import { useClaims } from "@/context";
import { apiClient } from "@/utils";
import { API_BASE_URL } from "@/constants";
import { toast } from "react-toastify";
import { useGetUser } from "../auth/useGetUser";

interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
}

export function useCancelSubscription() {
  const { token } = useClaims();
  const { refetch: refetchUser } = useGetUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const cancelSubscription = async (): Promise<boolean> => {
    if (!token) {
      const errorMsg = "No authentication token found";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await apiClient.post<CancelSubscriptionResponse>(
        `${API_BASE_URL}/v1/payments/cancel`,
      );

      if (response?.status === 201) {
        setIsSuccess(true);
        const successMsg =
          response.data.message || "Subscription cancelled successfully";
        toast.success(successMsg, {});
        // Refetch user data to update subscription status
        await refetchUser();
        return true;
      } else {
        const errorMsg =
          response.data.message || "Failed to cancel subscription";
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to cancel subscription";

      if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as { message?: string }).message || errorMessage;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsSuccess(false);
    setIsLoading(false);
  };

  return {
    cancelSubscription,
    isLoading,
    error,
    isSuccess,
    reset,
  };
}

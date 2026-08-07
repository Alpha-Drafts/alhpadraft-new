import React, { createContext, useContext, ReactNode } from "react";
import { useCreditBalance } from "@/hooks";

interface CreditContextProps {
  balance: number;
  isLoading: boolean;
  error: Error | null;
  refetchBalance: () => void;
}

const CreditContext = createContext<CreditContextProps | undefined>(undefined);

export const CreditProvider = ({ children }: { children: ReactNode }) => {
  const { balance, isLoading, error, refetch } = useCreditBalance();

  return (
    <CreditContext.Provider
      value={{
        balance,
        isLoading,
        error,
        refetchBalance: refetch,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
};

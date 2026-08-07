import React, { createContext, useContext, useState, ReactNode } from "react";
import { AuthFormType } from "@/components/auth/AuthModal";

interface AuthModalContextType {
  isOpen: boolean;
  initialForm: AuthFormType;
  selectedPlan?: string;
  openAuthModal: (formType?: AuthFormType, planId?: string) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined,
);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialForm, setInitialForm] = useState<AuthFormType>("signup");
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const openAuthModal = (
    formType: AuthFormType = "signup",
    planId?: string,
  ) => {
    setInitialForm(formType);
    setSelectedPlan(planId);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setSelectedPlan(undefined);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        initialForm,
        selectedPlan,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};

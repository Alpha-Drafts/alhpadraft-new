import React, { ReactNode } from "react";
import { ClaimsProvider } from "./ClaimsContext";
import { DashboardProvider } from "./DashboardContext";
import ReactQueryProvider from "./ReactQueryProvider";
import AuthProvider from "./AuthProvider";
import { NotificationProvider } from "./NotificationContext";
import { AuthModalProvider } from "./AuthModalContext";
import { CreditProvider } from "./CreditContext";
import { ProjectProvider } from "./ProjectContext";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <DashboardProvider>
          <ClaimsProvider>
            <CreditProvider>
              <ProjectProvider>
                <NotificationProvider>
                  <AuthModalProvider>{children}</AuthModalProvider>
                </NotificationProvider>
              </ProjectProvider>
            </CreditProvider>
          </ClaimsProvider>
        </DashboardProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
};

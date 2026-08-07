import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiClient, formatError, CustomHead } from "@/utils";
import { API_BASE_URL } from "@/constants";
import site from "@/site.metadata";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import EmailVerifiedMessage from "@/components/auth/EmailVerifiedMessage";

type VerificationStatus = "processing" | "success" | "failed";

const Page = () => {
  const router = useRouter();
  const { query } = router;
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const queryWithProps = {
    oobCode: typeof query.oobCode === "string" ? query.oobCode : "",
    continueUrl: typeof query.continueUrl === "string" ? query.continueUrl : "",
    mode: typeof query.mode === "string" ? query.mode : "",
  };

  useEffect(() => {
    if (queryWithProps.mode === "verifyEmail") {
      // Backend endpoint: POST /v1/auth/verify-email (to be added on the
      // decoupled backend). Uses the emailed verification token.
      apiClient
        .post(`${API_BASE_URL}/v1/auth/verify-email`, {
          token: queryWithProps.oobCode,
        })
        .then(() => {
          setVerificationStatus("success");
        })
        .catch(error => {
          const errorMsg = formatError(error, "Failed to verify email");
          setVerificationStatus("failed");
          setErrorMessage(errorMsg);
        });
    }
  }, [queryWithProps.mode, queryWithProps.oobCode]);

  return (
    <div>
      {queryWithProps.mode === "resetPassword" && (
        <ResetPasswordForm query={queryWithProps} />
      )}
      {queryWithProps.mode === "verifyEmail" && (
        <EmailVerifiedMessage
          verificationStatus={verificationStatus}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
};

export default Page;

Page.getLayout = function PageLayout(page: React.ReactNode) {
  return (
    <div>
      <CustomHead
        url={site?.url}
        canonicalUrl={site?.url}
        title={site?.title}
        description={site?.description}
        keywords={site?.keywords}
        noIndex
      />
      {page}
    </div>
  );
};

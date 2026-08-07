import React from "react";
import { useRouter } from "next/router";
import { Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/common";
import { userRoutes } from "@/constants";
import AuthHeader from "./AuthHeader";
import { useClaims } from "@/context";

type VerificationStatus = "processing" | "success" | "failed";

const EmailVerifiedMessage = ({
  verificationStatus = "processing",
  errorMessage,
}: {
  verificationStatus?: VerificationStatus;
  errorMessage?: string;
}) => {
  console.info(
    "EmailVerifiedMessage rendered with verificationStatus:",
    verificationStatus,
    "and errorMessage:",
    errorMessage,
  );

  const { refreshClaims } = useClaims();

  const router = useRouter();

  const handleButtonClick = async () => {
    await refreshClaims();
    if (verificationStatus === "success") {
      router.push(userRoutes?.dashboard);
    } else if (verificationStatus === "failed") {
      router.push("/");
    }
  };

  const getContent = () => {
    switch (verificationStatus) {
      case "processing":
        return {
          icon: <Loader2 className="icon animate-spin" />,
          title: "Verifying Email...",
          message: "Please wait while we verify your email address.",
          buttonText: "Verifying...",
          buttonDisabled: true,
          buttonLink: undefined,
        };

      case "success":
        return {
          icon: <CheckCircle className="icon text-green-500" />,
          title: "Email Verification Successful",
          message: `Your email has been successfully verified. You can now proceed to DocAuditor by AlphaDrafts.`,
          buttonText: "Continue to Dashboard",
          buttonDisabled: false,
          buttonLink: userRoutes?.dashboard,
        };

      case "failed":
        return {
          icon: <XCircle className="icon text-red-500" />,
          title: "Email Verification Failed",
          message:
            "We couldn't verify your email address. The link may have expired or is invalid.",
          buttonText: "Go to Home",
          buttonDisabled: false,
          buttonLink: "/",
        };

      default:
        return {
          icon: <Zap className="icon" />,
          title: "Email Verification",
          message: "Processing your email verification...",
          buttonText: "Please wait...",
          buttonDisabled: true,
          buttonLink: undefined,
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="auth">
        <div className="auth-content">
          <AuthHeader />

          <section className="modal-content">
            <div className="modal-content_container">
              <div className="modal-content_container-body">
                {/* Icon */}
                <span
                  className={`modal-content_icon-wrapper ${verificationStatus === "failed" ? "border-red-50 bg-red-100" : ""}`}
                >
                  {content.icon}
                </span>
                {/* End Icon */}
                <h3 className="modal-content_title">{content.title}</h3>
                <p className="modal-content_sub-title">{content.message}</p>
              </div>

              <div className="modal-content_button-wrapper">
                <Button
                  type="button"
                  disabled={content.buttonDisabled}
                  onClick={handleButtonClick}
                >
                  {content.buttonText}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifiedMessage;

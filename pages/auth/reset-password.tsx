import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import site from "@/site.metadata";
import { CustomHead } from "@/utils";
import { useRouter } from "next/router";
import React from "react";

const Page = () => {
  const router = useRouter();
  const { query } = router;

  const queryWithProps = {
    oobCode: typeof query.oobCode === "string" ? query.oobCode : "",
    continueUrl: typeof query.continueUrl === "string" ? query.continueUrl : "",
    mode: typeof query.mode === "string" ? query.mode : "",
  };

  return <ResetPasswordForm query={queryWithProps} />;
};

export default Page;

Page.getLayout = function PageLayout(page: React.ReactNode) {
  return (
    <div>
      <CustomHead
        title={site?.title + " - " + "Reset Password"}
        description={site?.description}
        keywords={site?.keywords}
        imageUrl={site?.cover_image}
        imageAlt={site?.cover_image_alt}
        url={site?.url}
        canonicalUrl={site?.url}
      />
      {page}
    </div>
  );
};

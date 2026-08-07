import PrivacyPolicyContent from "@/components/legalities/privacy";
import { PublicLayout } from "@/layouts";
import site from "@/site.metadata";
import { CustomHead } from "@/utils";
import React from "react";

const Page = () => {
  return (
    <>
      <CustomHead
        title="Privacy Policy | AlphaDrafts"
        description="Learn how AlphaDrafts collects, uses, and protects your personal data. Read our full privacy policy covering document handling, data storage, and your rights."
        url={`${site?.url}/privacy`}
        canonicalUrl={`${site?.url}/privacy`}
      />
      <PublicLayout>
        <PrivacyPolicyContent />
      </PublicLayout>
    </>
  );
};

export default Page;

import TermsContent from "@/components/legalities/terms";
import { PublicLayout } from "@/layouts";
import site from "@/site.metadata";
import { CustomHead } from "@/utils";
import React from "react";

const Page = () => {
  return (
    <>
      <CustomHead
        title="Terms and Conditions | AlphaDrafts"
        description="Review the terms and conditions for using AlphaDrafts. Understand your rights, obligations, and our policies on document checking, credits, and subscriptions."
        url={`${site?.url}/terms`}
        canonicalUrl={`${site?.url}/terms`}
      />
      <PublicLayout>
        <TermsContent />
      </PublicLayout>
    </>
  );
};

export default Page;

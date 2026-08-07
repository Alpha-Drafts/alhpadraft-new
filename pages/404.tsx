import React from "react";
import site from "@/site.metadata";
import { CustomHead } from "@/utils";
import FourZeroFourPage from "@/components/others/FourZeroFourPage";

export default function Page() {
  return <FourZeroFourPage />;
}

Page.getLayout = function PageLayout(page: React.ReactNode) {
  return (
    <>
      <CustomHead
        title={site?.title + " - Page Not Found"}
        description={"The page you are looking for does not exist."}
        url={site?.url + "/404"}
        canonicalUrl="/"
        noIndex
      />
      {page}
    </>
  );
};

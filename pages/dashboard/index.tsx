import React from "react";
import UserLayout from "@/layouts/UserLayout";
import { CustomHead } from "@/utils";
import site from "@/site.metadata";
import DashboardContent from "@/components/dashboard/overview";

const Page = () => {
  return <DashboardContent />;
};

export default Page;
Page.getLayout = function PageLayout(page: React.ReactNode) {
  return (
    <UserLayout>
      <CustomHead title={site?.title + " - Dashboard"} noIndex />
      {page}
    </UserLayout>
  );
};

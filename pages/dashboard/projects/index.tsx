import React from "react";
import UserLayout from "@/layouts/UserLayout";
import { CustomHead } from "@/utils";
import site from "@/site.metadata";
import AllProjectsContent from "@/components/dashboard/project-all";

const Page = () => {
  return <AllProjectsContent />;
};

export default Page;
Page.getLayout = function PageLayout(page: React.ReactNode) {
  return (
    <UserLayout>
      <CustomHead title={site?.title + " - All Projects"} noIndex />
      {page}
    </UserLayout>
  );
};

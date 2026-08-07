import React from "react";
import UserLayout from "@/layouts/UserLayout";
import { CustomHead } from "@/utils";
import site from "@/site.metadata";
import SettingsContent from "@/components/dashboard/settings";

const Page = () => {
  return <SettingsContent />;
};

export default Page;
Page.getLayout = function PageLayout(page: React.ReactNode) {
  return (
    <UserLayout title={"Settings"} isSettingPage>
      <CustomHead title={site?.title + " - Settings"} noIndex />
      {page}
    </UserLayout>
  );
};

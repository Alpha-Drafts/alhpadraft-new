import CreateProject from "@/components/dashboard/project-create";
import { API_BASE_URL } from "@/constants";
import { useClaims } from "@/context";
import { useFetchHook } from "@/hooks";
import UserLayout from "@/layouts/UserLayout";
import site from "@/site.metadata";
import { ProjectProps } from "@/types";
import { CustomHead } from "@/utils";
import { useRouter } from "next/router";
import React from "react";

const Page = () => {
  const router = useRouter();
  const { id } = router.query;

  const { token } = useClaims();

  const { data } = useFetchHook<ProjectProps>({
    endpoint: `${API_BASE_URL}/v1/projects/${id}`,
    enabled: !!token && !!id,
  });

  const projectName = data?.name || "Project";
  const pageTitle = `${site?.title} - ${projectName}`;

  return (
    <>
      <CustomHead title={pageTitle} noIndex />
      <CreateProject />
    </>
  );
};

export default Page;
Page.getLayout = function PageLayout(page: React.ReactNode) {
  return <UserLayout>{page}</UserLayout>;
};

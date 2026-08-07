import ProjectEditorWrapper from "@/components/dashboard/project-editor";
import { useProject } from "@/context";
import UserLayout from "@/layouts/UserLayout";
import site from "@/site.metadata";
import { CustomHead } from "@/utils";
import React from "react";

const Page = () => {
  const { currentProject } = useProject();

  const projectName = currentProject?.name || "Untitled Project";
  const pageTitle = `${projectName} - ${site?.title}`;

  return (
    <UserLayout title={projectName}>
      <CustomHead title={pageTitle} noIndex />
      <ProjectEditorWrapper />
    </UserLayout>
  );
};

export default Page;

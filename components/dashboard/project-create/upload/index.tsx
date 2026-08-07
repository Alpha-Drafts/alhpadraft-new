import { MultiStepProgress } from "@/common";
import React from "react";
import Header from "./Header";
import UploadForm from "./UploadForm";
import { ProjectProps } from "@/types";
import { API_BASE_URL } from "@/constants";
import { useClaims } from "@/context";
import { useFetchHook } from "@/hooks";

const UploadProject = ({
  id,
  setStep,
}: {
  id: string;
  setStep: React.Dispatch<React.SetStateAction<"upload" | "analyse">>;
}) => {
  const { token } = useClaims();

  const steps = [
    { label: "Upload" },
    { label: "Analyze" },
    { label: "Write" },
    { label: "Review" },
    { label: "Export" },
  ];

  const { data } = useFetchHook<ProjectProps>({
    endpoint: `${API_BASE_URL}/v1/projects/${id}`,
    enabled: !!token,
  });

  return (
    <div>
      <div className="flex w-full items-center justify-center">
        <MultiStepProgress steps={steps} currentStep={1} />
      </div>
      <Header project={data || ({} as ProjectProps)} />
      <UploadForm setStep={setStep} />
    </div>
  );
};

export default UploadProject;

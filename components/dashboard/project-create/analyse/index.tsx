import { LoadingState, MultiStepProgress } from "@/common";
import React, { useEffect } from "react";
import Guidance from "./Guidance";
import { API_BASE_URL } from "@/constants";
import { formatError } from "@/utils";
import { InstructionAnalysisProps } from "@/types";
import { useFetchHook } from "@/hooks";
import { useClaims } from "@/context";

const AnalyseProject = ({ id }: { id: string }) => {
  const steps = [
    { label: "Upload" },
    { label: "Analyze" },
    { label: "Write" },
    { label: "Review" },
    { label: "Export" },
  ];

  const { token } = useClaims();

  const [latestAnalysis, setLatestAnalysis] =
    React.useState<InstructionAnalysisProps | null>(null);

  const { data, isLoading, error, refetch } = useFetchHook<
    InstructionAnalysisProps[]
  >({
    endpoint: `${API_BASE_URL}/v1/projects/${id}/analysis`,
    enabled: !!token && !!id,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setLatestAnalysis(data[0]);
    }
  }, [data]);

  if (isLoading && !data) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Analysis Failed
          </h2>
          <p className="mb-4 text-gray-600">{formatError(error)}</p>
        </div>
      </div>
    );
  }

  return latestAnalysis ? (
    <div>
      <div className="flex w-full items-center justify-center">
        <MultiStepProgress steps={steps} currentStep={2} />
      </div>
      <Guidance analysisData={latestAnalysis} refetchAnalysis={refetch} />
    </div>
  ) : (
    <div className="flex w-full items-center justify-center">
      No analysis data available
    </div>
  );
};

export default AnalyseProject;

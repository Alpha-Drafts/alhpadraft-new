import { Button } from "@/common";
import {
  CircleCheckBig,
  PenTool,
  Plus,
  Target,
  BookOpen,
  Lightbulb,
  CheckCircle,
  Type,
  GraduationCap,
  FileText,
  Quote,
  Calendar,
} from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/router";
import AddInstructionsModal from "./AddInstructionsModal";
import { InstructionAnalysisProps, ProjectProps } from "@/types";
import { API_BASE_URL, userRoutes } from "@/constants";
import {
  apiClient,
  formatUnderscoreDateToDate,
  getStatusBgColor,
  getStatusBorderColor,
  getStatusColor,
  isDateOverdue,
} from "@/utils";
import { useClaims } from "@/context";
import { useFetchHook } from "@/hooks";
import { toast } from "react-toastify";

const Guidance = ({
  analysisData,
  refetchAnalysis,
}: {
  analysisData: InstructionAnalysisProps;
  refetchAnalysis: () => void;
}) => {
  const router = useRouter();
  const { id: projectId } = router.query;

  const { token } = useClaims();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: activeProject, refetch: refetchProject } =
    useFetchHook<ProjectProps>({
      endpoint: `${API_BASE_URL}/v2/projects/${projectId}`,
      enabled: !!token && !!projectId,
    });

  // Format the due date string to a readable format
  const dueDateString =
    typeof analysisData?.projectOverview?.dueDate == "string"
      ? ""
      : formatUnderscoreDateToDate(analysisData?.projectOverview?.dueDate);

  const isOverdue = isDateOverdue(
    dueDateString,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const isNotDraft = activeProject?.stage === 1 || activeProject?.stage === 2;

  // Ensure projectId is available
  if (!projectId) {
    return null;
  }

  const handleAddInstructions = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const onStartWriting = async () => {
    if (!token) return;

    if (!isNotDraft) {
      router.push(userRoutes?.project_draft + `/${projectId}`);
      return;
    }

    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/v1/projects/${projectId}/posts`,
        "",
        { headers: { "Content-Type": "text/plain" } },
      );
      const postId = response?.data?.data?.id;
      if (postId) {
        router.push(userRoutes?.project_draft + `/${projectId}`);
      }
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Failed to create post. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto mt-14 mb-10 max-w-6xl rounded-2xl border border-gray-200 p-6">
        {/* Project Overview */}
        <section>
          <div className="flex items-center space-x-2 text-black">
            <FileText className="text-primary-500 h-[17.5px] w-[17.5px]" />
            <h2 className="text-body-semibold-14">Project Overview</h2>
          </div>

          <h3 className="text-body-semibold-16 mt-[21px] text-black">
            {analysisData?.projectOverview?.name || "-"}
          </h3>
          <p className="text-body-regular-14 text-gray-500">
            {analysisData?.projectOverview?.description || "-"}
          </p>

          <div className="text-body-regular-12 mt-[21px] flex flex-wrap items-center space-x-4 text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="h-[14px] w-[14px] capitalize" />
              <span
                className={`${getStatusColor(analysisData?.projectOverview?.type || "")} ${getStatusBgColor(analysisData?.projectOverview?.type || "")} ${getStatusBorderColor(analysisData?.projectOverview?.type || "")} inline-block rounded-md border px-1 text-xs capitalize`}
              >
                Type:{" "}
                {analysisData?.projectOverview?.type
                  ? analysisData.projectOverview.type.replaceAll("_", " ")
                  : "-"}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-[14px] w-[14px]" />
              <span
                className={`${isOverdue ? "text-red-600" : "text-gray-500"}`}
              >
                Due: {dueDateString ? dueDateString : "No due date"}
              </span>
            </div>
          </div>
        </section>

        <hr className="my-6 border-gray-200" />

        {/* Target Metrics */}
        <section>
          <div className="mb-4 flex space-x-2">
            <Target className="text-primary-500 h-[17.5px] w-[17.5px]" />
            <h2 className="text-body-semibold-14 text-black">Target Metrics</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center space-x-3">
              <Type className="h-4 w-4 text-blue-500" />
              <div>
                <h3 className="text-body-medium-14 text-gray-500">Tone</h3>
                <p className="text-body-regular-14 text-black capitalize">
                  {analysisData?.targetMetrics?.tone || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <h3 className="text-body-medium-14 text-gray-500">
                  Word Length
                </h3>
                <p className="text-body-regular-14 text-black">
                  {analysisData?.targetMetrics?.wordLength || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-4 w-4 text-purple-500" />
              <div>
                <h3 className="text-body-medium-14 text-gray-500">
                  Reading Level
                </h3>
                <p className="text-body-regular-14 text-black capitalize">
                  {analysisData?.targetMetrics?.readingLevel || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BookOpen className="h-4 w-4 text-orange-500" />
              <div>
                <h3 className="text-body-medium-14 text-gray-500">
                  Sources Needed
                </h3>
                <p className="text-body-regular-14 text-black">
                  {analysisData?.targetMetrics?.sourcesNeeded || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Quote className="h-4 w-4 text-red-500" />
              <div>
                <h3 className="text-body-medium-14 text-gray-500">
                  Citation Format
                </h3>
                <p className="text-body-regular-14 text-black uppercase">
                  {analysisData?.targetMetrics?.citationFormat || "-"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Structure Guidance Section */}
      <section className="mx-auto max-w-6xl rounded-2xl border border-gray-200 p-6">
        <div className="flex space-x-2">
          <Target className="text-primary-500 h-[17.5px] w-[17.5px]" />
          <h2 className="text-body-semibold-14 text-black">
            Structure Guidance
          </h2>
        </div>
        <p className="text-body-regular-14 mt-[19.88px] text-gray-500">
          {analysisData?.structureGuidance?.goal || "-"}
        </p>
        {/* Steps */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analysisData?.structureGuidance?.sections &&
          Array.isArray(analysisData.structureGuidance.sections) ? (
            analysisData.structureGuidance.sections.map((step, index) => (
              <div
                key={step?.title || index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex justify-between">
                  <h3 className="text-body-semibold-14 text-black">
                    {step?.title || "-"}
                  </h3>
                </div>
                <p className="text-body-regular-14 mt-[6.3px] text-gray-500">
                  {step?.description || "-"}
                </p>
                {step?.tips &&
                  Array.isArray(step.tips) &&
                  step.tips.length > 0 && (
                    <ul className="text-body-regular-14 mt-[10.49px] space-y-2 text-gray-600">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex">
                          <CircleCheckBig className="mt-0.5 h-[14px] min-w-[14px] text-green-500" />
                          <span className="ml-1.5">{tip || "-"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            ))
          ) : (
            <p className="text-body-regular-14 text-gray-500">
              No structure guidance available
            </p>
          )}
        </div>
      </section>

      {/* Writing Tips Section */}
      <section className="mx-auto max-w-6xl rounded-2xl border border-gray-200 p-6">
        <div className="mb-4 flex space-x-2">
          <Lightbulb className="text-primary-500 h-[17.5px] w-[17.5px]" />
          <h2 className="text-body-semibold-14 text-black">Writing Tips</h2>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analysisData?.writingTips &&
          Array.isArray(analysisData.writingTips) ? (
            analysisData.writingTips.map((tipCategory, index) => (
              <div key={index} className="space-y-4">
                {tipCategory.content && Array.isArray(tipCategory.content) && (
                  <div>
                    <h3 className="text-body-semibold-14 text-black">
                      Content
                    </h3>
                    <ul className="text-body-regular-14 mt-[10.49px] space-y-2 text-gray-600">
                      {tipCategory.content.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex">
                          <CircleCheckBig className="mt-0.5 h-[14px] min-w-[14px] text-green-500" />
                          <span className="ml-1.5">{tip || "-"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tipCategory.style && Array.isArray(tipCategory.style) && (
                  <div>
                    <h3 className="text-body-semibold-14 text-black">Style</h3>
                    <ul className="text-body-regular-14 mt-[10.49px] space-y-2 text-gray-600">
                      {tipCategory.style.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex">
                          <CircleCheckBig className="mt-0.5 h-[14px] min-w-[14px] text-green-500" />
                          <span className="ml-1.5">{tip || "-"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tipCategory.organization &&
                  Array.isArray(tipCategory.organization) && (
                    <div>
                      <h3 className="text-body-semibold-14 text-black">
                        Organization
                      </h3>
                      <ul className="text-body-regular-14 mt-[10.49px] space-y-2 text-gray-600">
                        {tipCategory.organization.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex">
                            <CircleCheckBig className="mt-0.5 h-[14px] min-w-[14px] text-green-500" />
                            <span className="ml-1.5">{tip || "-"}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ))
          ) : (
            <p className="text-body-regular-14 text-gray-500">
              No writing tips available
            </p>
          )}
        </div>
      </section>

      {/* Success Criteria Section */}
      <section className="mx-auto max-w-6xl rounded-2xl border border-gray-200 p-6">
        <div className="mb-4 flex space-x-2">
          <CheckCircle className="text-primary-500 h-[17.5px] w-[17.5px]" />
          <h2 className="text-body-semibold-14 text-black">Success Criteria</h2>
        </div>
        <div className="space-y-3">
          {analysisData?.successCriteria &&
          Array.isArray(analysisData.successCriteria) ? (
            analysisData.successCriteria.map((criteria, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CircleCheckBig className="mt-0.5 h-[14px] min-w-[14px] text-green-500" />
                <p className="text-body-regular-14 text-gray-700">{criteria}</p>
              </div>
            ))
          ) : (
            <p className="text-body-regular-14 text-gray-500">
              No success criteria available
            </p>
          )}
        </div>
      </section>

      {/* Assumptions Section */}
      {analysisData?.assumptions &&
        Array.isArray(analysisData.assumptions) &&
        analysisData.assumptions.length > 0 && (
          <section className="mx-auto max-w-6xl rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <div className="mb-4 flex space-x-2">
              <Lightbulb className="h-[17.5px] w-[17.5px] text-orange-500" />
              <h2 className="text-body-semibold-14 text-orange-800">
                Assumptions Made
              </h2>
            </div>
            <div className="space-y-2">
              {analysisData.assumptions.map((assumption, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CircleCheckBig className="mt-0.5 h-[14px] min-w-[14px] text-orange-500" />
                  <p className="text-body-regular-14 text-orange-700">
                    {assumption}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      <section className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAddInstructions}
        >
          Update Instructions
        </Button>
        <Button onClick={onStartWriting} icon={<PenTool className="h-4 w-4" />}>
          {isNotDraft ? "Start Writing" : " Continue Writing"}
        </Button>
      </section>
      <AddInstructionsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectId={projectId as string}
        refetchData={() => {
          refetchAnalysis();
          refetchProject();
        }}
        initialInstructions={
          activeProject?.instructionText || analysisData?.textContent || ""
        }
      />
    </div>
  );
};

export default Guidance;

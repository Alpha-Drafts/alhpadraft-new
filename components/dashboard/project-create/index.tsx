import React, { useEffect, useState } from "react";
import UploadProject from "./upload";
import AnalyseProject from "./analyse";
import { useRouter } from "next/router";

const CreateProject = () => {
  const router = useRouter();
  const { id, step: stepQuery } = router.query;
  const projectId = id as string;

  // console.log(id, step)

  const [step, setStep] = useState<"upload" | "analyse">("analyse");

  // Sync step with query param if present
  useEffect(() => {
    if (stepQuery === "analyse") {
      setStep("analyse");
    } else {
      setStep("upload");
    }
  }, [stepQuery]);

  // Custom setStep function that also updates the URL
  const setStepWithURL: React.Dispatch<
    React.SetStateAction<"upload" | "analyse">
  > = action => {
    let newStep: "upload" | "analyse";

    if (typeof action === "function") {
      newStep = action(step);
    } else {
      newStep = action;
    }

    setStep(newStep);

    if (newStep === "analyse") {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, step: "analyse" },
        },
        undefined,
        { shallow: true },
      );
    } else {
      const queryWithoutStep = { ...router.query };
      delete queryWithoutStep.step;
      router.push(
        {
          pathname: router.pathname,
          query: queryWithoutStep,
        },
        undefined,
        { shallow: true },
      );
    }
  };

  return (
    <>
      {step === "upload" && (
        <UploadProject id={projectId} setStep={setStepWithURL} />
      )}
      {step === "analyse" && <AnalyseProject id={projectId} />}
    </>
  );
};

export default CreateProject;

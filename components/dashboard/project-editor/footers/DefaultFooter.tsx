import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button, ProcessingModal } from "@/common";
import DownloadDocxButton from "@/common/ui/DownloadDocxButton";
import { CheckSelectionModal } from "../modals/CheckSelectionModal";
import { useProjects } from "@/hooks";

interface DefaultFooterProps {
  projectId: string;
  _content: string;
  isSaving: boolean;
  onSaveDraft: () => Promise<string | null>;
  projectName?: string;
  lastSaved?: string;
}

const DefaultFooter: React.FC<DefaultFooterProps> = ({
  _content,
  isSaving,
  onSaveDraft,
  projectName,
}) => {
  // Modal/progress state for integrity checks
  const [showCheckSelection, setShowCheckSelection] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<
    "running" | "complete"
  >("running");
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const { handleRefetch: refetchProjects } = useProjects();

  const handleRunCheckClick = () => {
    if (isSaving) return;
    setShowCheckSelection(true);
  };

  const runChecks = (checks: string[]) => {
    if (isSaving) return;

    setSelectedChecks(checks);
    setShowCheckSelection(false);
    setProcessing(true);
    setProgress(0);
    setProcessingStage("running");

    window.dispatchEvent(
      new CustomEvent("integrity:recheck", {
        detail: { selectedChecks: checks },
      }),
    );

    // Animate progress to 80% while checks run; the completion event advances to 100%.
    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      setProgress(Math.min(current, 80));
      if (current >= 80) clearInterval(interval);
    }, 300);

    refetchProjects();
  };

  // Close the modal once DefaultAssistant signals all checks are done.
  useEffect(() => {
    const handleComplete = () => {
      setProgress(100);
      setProcessingStage("complete");
      setTimeout(() => setProcessing(false), 600);
    };
    window.addEventListener("integrity:recheck:complete", handleComplete);
    return () =>
      window.removeEventListener("integrity:recheck:complete", handleComplete);
  }, []);

  useEffect(() => {
    if (!processing) {
      setProgress(0);
    }
  }, [processing]);

  return (
    <>
      {/* Check Selection Modal */}
      <CheckSelectionModal
        isOpen={showCheckSelection}
        onConfirm={runChecks}
        onCancel={() => setShowCheckSelection(false)}
        wordCount={
          _content
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .split(/\s+/)
            .filter(Boolean).length
        }
        initialChecks={selectedChecks}
      />

      {/* footer */}
      <div className="flex items-center justify-end">
        <section className="mt-5 flex flex-wrap items-center gap-2 sm:justify-end">
          <Button variant="plain" onClick={onSaveDraft} disabled={isSaving}>
            Save Changes
          </Button>
          <DownloadDocxButton
            text="Download Docx"
            project={{ name: projectName || "Untitled Project" }}
            latestHtml={_content}
            variant="outline"
          />
          <Button
            onClick={handleRunCheckClick}
            icon={<RefreshCcw className="h-4 w-4" />}
            iconPosition="right"
            disabled={isSaving}
            loading={isSaving}
          >
            Run Check
          </Button>
        </section>
      </div>

      <ProcessingModal
        isOpen={processing}
        icon={<RefreshCcw className="h-8 w-8 text-white" />}
        title="Integrity Check Running"
        subtitle={(() => {
          const checkNames = {
            ai: "AI detection",
            plagiarism: "plagiarism",
            alignment: "alignment",
          };
          const names = selectedChecks
            .map(id => checkNames[id as keyof typeof checkNames])
            .filter(Boolean);

          if (names.length === 0) return "Running checks...";
          if (names.length === 1) return `Rechecking ${names[0]}`;
          if (names.length === 2)
            return `Rechecking ${names[0]} and ${names[1]}`;
          return `Rechecking ${names[0]}, ${names[1]}, and ${names[2]}`;
        })()}
        progress={progress}
        progressMessage={
          processingStage === "running"
            ? "Analyzing highlighted sections..."
            : "Checks complete"
        }
      />
    </>
  );
};

export default DefaultFooter;

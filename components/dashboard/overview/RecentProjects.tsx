import React, { useEffect, useState } from "react";
import { Eye, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/common";
import { ProjectCard } from "./ProjectCard";
import CreateProjectModal from "./CreateProjectModal";
import DeleteProjectModal from "./DeleteProjectModal";
import { API_BASE_URL, userRoutes } from "@/constants";
import { useFetchHook } from "@/hooks";
import { ProjectHistoryProps, ProjectProps } from "@/types";
import { useClaims } from "@/context";
import { apiClient, formatError } from "@/utils";
import { toast } from "react-toastify";

const ProjectCardSkeleton = () => (
  <div className="skeleton-card overflow-hidden">
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="skeleton h-10 w-10 rounded-[var(--radius-button)]" />
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
      <div className="mt-4 skeleton h-5 w-3/4 rounded-md" />
      <div className="mt-3 skeleton h-1 w-12 rounded-full" />
      <div className="mt-3 skeleton h-3 w-28 rounded-md" />
    </div>
  </div>
);

const RecentProjects = () => {
  const { token } = useClaims();

  const [projectHistory, setProjectData] = useState<ProjectProps[] | null>(
    null,
  );
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectProps | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    setShowNewProjectModal(true);
  };

  const closeModal = () => setShowNewProjectModal(false);

  const {
    data: projectData,
    isLoading,
    isError,
    error,
  } = useFetchHook<ProjectHistoryProps>({
    endpoint: `${API_BASE_URL}/v2/projects?skip=0&take=3`,
    enabled: !!token,
  });

  useEffect(() => {
    if (projectData?.data) {
      setProjectData(projectData?.data);
    }
  }, [projectData]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`${API_BASE_URL}/v2/projects/${deleteTarget.id}`);
      setProjectData(prev =>
        prev ? prev.filter(p => p.id !== deleteTarget.id) : prev,
      );
      toast.success("Project deleted successfully.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <CreateProjectModal isOpen={showNewProjectModal} onClose={closeModal} />
      <DeleteProjectModal
        isOpen={!!deleteTarget}
        projectName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      <section className="mt-10">
        {/* Section Header */}
        <div className="mb-6 flex flex-col items-center justify-between md:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)]" style={{ background: "var(--color-primary-container)" }}>
                <FolderOpen className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
              </div>
              <h2
                className="font-semibold text-[var(--color-text-primary)]"
                style={{ fontSize: "1.25rem", lineHeight: "28px", letterSpacing: "-0.01em" }}
              >
                Recent Projects
              </h2>
            </div>
            <p
              className="ml-10 mt-0.5 uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]"
              style={{ fontSize: "0.7rem", lineHeight: "16px", fontWeight: 600 }}
            >
              Showing {projectHistory?.length || 0} of{" "}
              {projectData?.totalCount || 0} projects
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:mt-0">
            <Button
              text="See All Projects"
              variant="secondary"
              icon={<Eye className="h-4 w-4" />}
              iconPosition="left"
              className="h-[35px] px-4 whitespace-nowrap"
              link={userRoutes?.projects}
            />
            <Button
              text="New Project"
              variant="secondary"
              icon={<Plus className="h-4 w-4" />}
              iconPosition="left"
              className="h-[35px] px-4 whitespace-nowrap"
              onClick={handleClick}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : isError ? (
            <div className="col-span-3 flex h-32 items-center justify-center rounded-[var(--radius-card-elevated)] border border-[var(--color-error-container)] bg-[var(--color-error-container)]">
              <span className="text-sm font-medium text-[var(--color-on-error-container)]">
                {formatError(error, "Failed to load projects.")}
              </span>
            </div>
          ) : projectHistory?.length === 0 ? (
            <div className="col-span-3 glass flex flex-col items-center justify-center rounded-[var(--radius-card-elevated)] p-12" style={{ boxShadow: "var(--elevation-1)" }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--color-primary-container)" }}>
                <FolderOpen className="h-7 w-7" style={{ color: "var(--color-primary)" }} />
              </div>
              <p className="mt-4 text-sm font-medium text-[var(--color-text-primary)]">No recent projects found.</p>
              <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">Create your first project to get started.</p>
              <Button
                text="New Project"
                variant="secondary"
                icon={<Plus className="h-4 w-4" />}
                iconPosition="left"
                className="mt-4 h-[35px] px-4"
                onClick={handleClick}
              />
            </div>
          ) : (
            projectHistory?.map((proj, index) => (
              <div
                key={proj.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
              >
                <ProjectCard
                  project={proj}
                  onDelete={setDeleteTarget}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
};

export default RecentProjects;

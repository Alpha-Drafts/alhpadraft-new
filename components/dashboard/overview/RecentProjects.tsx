import React, { useEffect, useState } from "react";
import { Eye, Plus } from "lucide-react";
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

      <section>
        <div>
          {/* Header */}
          <div className="mt-20 mb-6 flex flex-col items-center justify-between md:flex-row">
            <div>
              <h2 className="text-body-semibold-18 text-black">
                Recent Projects
              </h2>
              <p className="text-body-regular-12 text-gray-500">
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
              <div className="col-span-3 flex h-32 items-center justify-center">
                <span>Loading...</span>
              </div>
            ) : isError ? (
              <div className="col-span-3 flex h-32 items-center justify-center text-red-500">
                <span>{formatError(error, "Failed to load projects.")}</span>
              </div>
            ) : projectHistory?.length === 0 ? (
              <div className="col-span-3 flex h-32 items-center justify-center">
                <span>No recent projects found.</span>
              </div>
            ) : (
              projectHistory?.map(proj => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default RecentProjects;

import React from "react";
import { ChevronDown, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { useProjectSelector } from "@/hooks/misc/useProjectSelector";

interface ProjectSelectorProps {
  isOpen: boolean;
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  handleCreateProject: () => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  isOpen,
  selectedProject,
  setSelectedProject,
  handleCreateProject,
}) => {
  const {
    projectData,
    isLoading,
    error,
    isDropdownOpen,
    setIsDropdownOpen,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    dropdownRef,
  } = useProjectSelector(isOpen);

  return (
    <div className="mb-6">
      <label className="mb-2 block text-sm font-medium text-[#101928]">
        Select Project
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
        >
          <span
            className={selectedProject ? "text-gray-900" : "text-[#8E8E93]"}
          >
            {selectedProject
              ? projectData?.data?.find(p => p.id === selectedProject)?.name ||
                (isLoading
                  ? "Loading project..."
                  : `Project ${selectedProject}`)
              : "Choose a project..."}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={handleCreateProject}
              className="flex w-full items-center gap-2 border-b border-gray-100 px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" /> Create New Project
            </button>

            {isLoading ? (
              <div className="px-3 py-2 text-center text-sm text-gray-500">
                Loading projects...
              </div>
            ) : error ? (
              <div className="p-3 text-center text-sm text-red-500">
                Failed to load projects: {error.message || "Unknown error"}
              </div>
            ) : projectData?.data?.length ? (
              <>
                <div role="listbox" aria-label="Projects">
                  {projectData.data.map(project => (
                    <button
                      key={project.id}
                      type="button"
                      role="option"
                      aria-selected={!!(selectedProject === project.id)}
                      onClick={() => {
                        setSelectedProject(project.id);
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        className={`p-1 ${
                          currentPage === 1
                            ? "text-gray-400"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        className={`p-1 ${
                          currentPage === totalPages
                            ? "text-gray-400"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No projects found. Create a project first.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelector;

import React, { useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  FolderPlus,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { Button, Dropdown, Pagination } from "@/common";
import DeleteProjectModal from "../overview/DeleteProjectModal";
import CreateProjectModal from "../overview/CreateProjectModal";
import { PROJECT_SORT_OPTIONS } from "@/constants";
import { useProjects } from "@/hooks/useProjects";
import ProjectGridCard from "./ProjectGridCard";
import ProjectSkeletonCard from "./ProjectSkeletonCard";

const ITEMS_PER_PAGE = 24;

const Projects: React.FC = () => {
  const {
    projectHistory,
    filteredProjects,
    isLoading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    setSearch,
    setSort,
    search,
    sort,
    handlePrevPage,
    handleNextPage,
    handleDeleteConfirm,
    handleRefetch,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
  } = useProjects({
    itemsPerPage: ITEMS_PER_PAGE,
    initialSort: PROJECT_SORT_OPTIONS[0],
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  return (
    <>
      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
      />

      {/* Delete Project Modal */}
      <DeleteProjectModal
        isOpen={!!deleteTarget}
        projectName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      <section className="p-2 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                All Projects
              </h1>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Manage, search, and continue writing your documents.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                text="New Project"
                variant="primary"
                size="md"
                rounded="md"
                icon={<Plus className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleOpenCreateModal}
                className="h-11 px-5 font-medium whitespace-nowrap shadow-sm hover:shadow"
              />
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input (10px border radius) */}
            <div className="relative w-full sm:max-w-md lg:max-w-lg">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder="Search projects by name, description, or type..."
                className="w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pr-9 pl-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-all focus:border-[#1A73E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8]"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-medium text-slate-400 lg:inline-block">
                  Sort by:
                </span>
                <Dropdown
                  label={sort.replace(/_/g, " ")}
                  options={PROJECT_SORT_OPTIONS}
                  selectedOption={sort}
                  onSelect={setSort}
                  icon={<CalendarClock className="h-4 w-4 text-slate-500" />}
                  iconPosition="left"
                  variant="outline"
                  className="h-10 rounded-[10px] border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProjectSkeletonCard key={`skeleton-${index}`} />
                ))}
              </div>
            </div>
          ) : error && (!projectHistory || projectHistory.length === 0) ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                Failed to load projects
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                There was a problem fetching your projects. Please check your
                connection and try again.
              </p>
              <Button
                text="Try Again"
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                iconPosition="left"
                onClick={handleRefetch}
                className="mt-5 rounded-[10px] bg-white font-medium"
              />
            </div>
          ) : projectHistory && projectHistory.length > 0 ? (
            /* Populated State with Results */
            <div className="space-y-6">
              {filteredProjects && filteredProjects.length > 0 ? (
                <>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>
                      Showing {filteredProjects.length} of {projectHistory.length}{" "}
                      {projectHistory.length === 1 ? "project" : "projects"}
                    </span>
                  </div>

                  {/* Projects Grid (16px radius cards on white background) */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project, index) => (
                      <ProjectGridCard
                        key={project.id || index}
                        project={project}
                        forceDraftLink
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Search No-Match State */
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <SearchX className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    No matching projects
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    We couldn&apos;t find any projects matching &quot;{search}&quot;. Try searching with different keywords.
                  </p>
                  <Button
                    text="Clear Search"
                    variant="secondary"
                    size="sm"
                    onClick={handleClearSearch}
                    className="mt-5 rounded-[10px] font-medium"
                  />
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalPages={totalPages}
                totalItems={projectHistory.length}
                handleNextPage={handleNextPage}
                handlePrevPage={handlePrevPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          ) : (
            /* Empty State (No Projects Exist) */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-xs border border-slate-200">
                <FolderPlus className="h-7 w-7 text-[#1A73E8]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No projects yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Create your first writing project to get started with AI originality, plagiarism, and brief alignment checks.
              </p>
              <Button
                text="Create First Project"
                variant="primary"
                size="md"
                rounded="md"
                icon={<Plus className="h-4 w-4" />}
                iconPosition="left"
                onClick={handleOpenCreateModal}
                className="mt-6 h-11 px-5 font-medium shadow-sm hover:shadow"
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Projects;

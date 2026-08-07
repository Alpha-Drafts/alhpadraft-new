import { CalendarClock, Search } from "lucide-react";
import React from "react";
import { Dropdown, LoadingState, Pagination } from "@/common";
import { ProjectCard } from "../overview/ProjectCard";
import DeleteProjectModal from "../overview/DeleteProjectModal";
import { PROJECT_SORT_OPTIONS } from "@/constants";
import { useProjects } from "@/hooks/useProjects";

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
    deleteTarget,
    setDeleteTarget,
    isDeleting,
  } = useProjects({
    itemsPerPage: ITEMS_PER_PAGE,
    initialSort: PROJECT_SORT_OPTIONS[0],
  });

  return (
    <>
      {isLoading && <LoadingState />}

      <DeleteProjectModal
        isOpen={!!deleteTarget}
        projectName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      <section className="p-2 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder="Search projects by name, description, or type..."
                className="text-bold-regular-14 w-full rounded-[6.75px] border-none bg-gray-100 py-3 pr-4 pl-8 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                label={sort.replace(/_/g, " ")}
                options={PROJECT_SORT_OPTIONS}
                selectedOption={sort}
                onSelect={setSort}
                icon={<CalendarClock className="h-4 w-4 text-gray-500" />}
                iconPosition="left"
                variant="primary"
                className="text-bold-regular-12 rounded-[6.75px] py-3"
              />
              {/* <Button
                variant="plain"
                className="hover:!bg-gray-100"
                size="sm"
                onClick={() =>
                  setOrder(prev => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {order === "asc" ? (
                  <ArrowUpNarrowWide className="h-4 w-4 text-black" />
                ) : (
                  <ArrowDownNarrowWide className="h-4 w-4 text-black" />
                )}
              </Button> */}
            </div>
          </div>

          {projectHistory && projectHistory?.length > 0 ? (
            <div className="space-y-4">
              {filteredProjects && filteredProjects.length > 0 ? (
                <>
                  <div className="text-sm text-gray-500">
                    Showing {filteredProjects.length} of {projectHistory.length}{" "}
                    projects
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project, index) => (
                      <ProjectCard
                        key={project.id || index}
                        project={project}
                        forceDraftLink
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-6 flex items-center justify-center">
                  <p className="text-body-semibold-14 text-neutral-500">
                    No projects match your search.
                  </p>
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalPages={totalPages}
                totalItems={projectHistory?.length || 0}
                handleNextPage={handleNextPage}
                handlePrevPage={handlePrevPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center">
              <p className="text-body-semibold-14 text-red-500">
                {"Error fetching projects"}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-body-semibold-14 text-neutral-500">
                No projects found.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Projects;

import { useState, useEffect, useCallback } from "react";
import { ProjectProps } from "@/types";
import { useFetchHook } from "@/hooks";
import { API_BASE_URL } from "@/constants";
import { apiClient } from "@/utils";
import { toast } from "react-toastify";
import { useClaims } from "@/context";

interface ProjectHistoryProps {
  data: ProjectProps[];
  totalCount: number;
}

interface UseProjectsOptions {
  itemsPerPage?: number;
  initialSort?: string;
}

export const useProjects = (options: UseProjectsOptions = {}) => {
  const { token } = useClaims();
  const itemsPerPage = options.itemsPerPage || 24;
  const initialSort = options.initialSort || "createdAt";

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projectHistory, setProjectHistory] = useState<ProjectProps[] | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(initialSort);
  const [order] = useState("desc");
  const [deleteTarget, setDeleteTarget] = useState<ProjectProps | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Build query string
  const queryParams = [
    `skip=${(currentPage - 1) * itemsPerPage}`,
    `take=${itemsPerPage}`,
    `sort=${sort}`,
    `order=${order}`,
  ]
    .filter(Boolean)
    .join("&");

  const {
    data: projectData,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch,
  } = useFetchHook<ProjectHistoryProps>({
    endpoint: `${API_BASE_URL}/v2/projects?${queryParams}`,
    enabled: !!token && !!currentPage && !!itemsPerPage && !!sort,
  });

  const isLoading = isLoadingProjects;
  const error = projectsError;

  // Sync project data
  useEffect(() => {
    if (projectData) {
      setProjectHistory(projectData?.data);
      setTotalPages(Math.ceil(projectData?.totalCount / itemsPerPage));
    }
  }, [projectData, itemsPerPage]);

  // Filter projects based on search term
  const filteredProjects =
    projectHistory?.filter(project => {
      if (!search.trim()) return true;

      const searchLower = search.toLowerCase();
      return (
        project.name?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.type?.toLowerCase().includes(searchLower) ||
        project.status?.toLowerCase().includes(searchLower)
      );
    }) || null;

  // Pagination actions
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  // Delete project
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`${API_BASE_URL}/v2/projects/${deleteTarget.id}`);
      setProjectHistory(prev =>
        prev ? prev.filter(p => p.id !== deleteTarget.id) : prev,
      );
      toast.success("Project deleted successfully.");
      refetch();
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget]);

  // Refetch projects with fresh data
  const handleRefetch = useCallback(async () => {
    try {
      const response = await refetch();
      if (response?.data) {
        const projectData = response.data as ProjectHistoryProps;

        setProjectHistory(projectData.data);
        setTotalPages(Math.ceil(projectData.totalCount / itemsPerPage));
      }
    } catch (error) {
      console.error("[useProjects] Error refetching:", error);
      toast.error("Failed to refresh projects.");
    }
  }, [refetch, itemsPerPage]);

  return {
    // Data
    projectHistory,
    filteredProjects,
    isLoading,
    error,
    currentPage,
    totalPages,

    // State setters
    setProjectHistory,
    setCurrentPage,
    setSearch,
    setSort,

    // Handlers
    handlePrevPage,
    handleNextPage,
    handleDeleteConfirm,
    handleRefetch,

    // Delete state
    deleteTarget,
    setDeleteTarget,
    isDeleting,

    // Search and filter
    search,
    sort,
    order,
    refetch,
  };
};

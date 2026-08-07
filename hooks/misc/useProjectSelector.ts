import { useState, useEffect, useRef } from "react";
import { useFetchHook } from "@/hooks";
import { ProjectHistoryProps } from "@/types";
import { API_BASE_URL, ITEMS_PER_PAGE } from "@/constants";
import { useClaims } from "@/context";

export function useProjectSelector(isOpen: boolean) {
  const { token } = useClaims();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const queryParams = `skip=${skip}&take=${ITEMS_PER_PAGE}&order=desc`;

  const {
    data: projectData,
    isLoading,
    error,
    refetch,
  } = useFetchHook<ProjectHistoryProps>({
    endpoint: `${API_BASE_URL}/v1/projects?${queryParams}`,
    enabled: !!token && isOpen,
  });

  const totalPages = projectData?.totalCount
    ? Math.ceil(projectData.totalCount / ITEMS_PER_PAGE)
    : 0;

  useEffect(() => {
    if (projectData?.totalCount && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [projectData?.totalCount, currentPage, totalPages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(p => p + 1);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(p => p - 1);

  return {
    projectData,
    isLoading,
    error,
    refetch,
    isDropdownOpen,
    setIsDropdownOpen,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    dropdownRef,
    setCurrentPage,
  };
}

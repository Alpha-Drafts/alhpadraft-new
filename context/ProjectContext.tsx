import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { ProjectProps } from "@/types";
import { apiClient } from "@/utils";
import { API_BASE_URL } from "@/constants";

interface ProjectContextType {
  currentProject: ProjectProps | null;
  isLoading: boolean;
  error: string | null;
  setCurrentProject: (project: ProjectProps | null) => void;
  loadProject: (projectId: string) => Promise<ProjectProps | null>;
  clearCurrentProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentProject, setCurrentProjectState] =
    useState<ProjectProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrentProject = useCallback(
    (project: ProjectProps | null) => {
      setCurrentProjectState(project);
      setError(null);
    },
    [setCurrentProjectState],
  );

  const loadProject = useCallback(
    async (projectId: string): Promise<ProjectProps | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Always fetch fresh from database
        const response = await apiClient.get(
          `${API_BASE_URL}/v2/projects/${projectId}`,
        );

        if (response.data?.data) {
          const project = response.data.data;

          setCurrentProject(project);
          return project;
        }

        throw new Error("Project data not found in response");
      } catch (err: unknown) {
        const errorMessage =
          err && typeof err === "object" && "message" in err
            ? (err as { message?: string }).message || "Failed to load project"
            : "Failed to load project";
        console.error("[ProjectContext] Error loading project:", errorMessage);
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentProject],
  );

  const clearCurrentProject = useCallback(() => {
    setCurrentProjectState(null);
    setError(null);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        isLoading,
        error,
        setCurrentProject,
        loadProject,
        clearCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Editor from "./Editor";
import type { Editor as TiptapEditor } from "@tiptap/react";
import DefaultAssistant from "./assistants/DefaultAssistant";
import type { ProjectProps } from "@/types";
import { useClaims, useProject } from "@/context";
import { apiClient } from "@/utils";
import { toast } from "react-toastify";
import { Pencil, Search, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { API_BASE_URL, userRoutes } from "@/constants";
import DeleteProjectModal from "../overview/DeleteProjectModal";
import { useProjects } from "@/hooks";

const ProjectEditorWrapper = () => {
  const router = useRouter();
  const { projectId: id } = router.query;
  const { token } = useClaims();
  const {
    currentProject,
    setCurrentProject,
    loadProject,
    isLoading: isLoadingProject,
  } = useProject();
  const [focusMode, setFocusMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refetch } = useProjects();

  const handleDeleteProject = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`${API_BASE_URL}/v2/projects/${id}`);
      refetch();
      toast.success("Project deleted successfully.");
      router.push(userRoutes.projects);
    } catch {
      toast.error("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Load project when ID changes
  useEffect(() => {
    if (token && id && typeof id === "string") {
      // Check if we already have this project in context
      if (currentProject && currentProject.id === id) {
        return; // Already loaded
      }
      // Load project from backend
      loadProject(id);
    }
  }, [id, token, currentProject, loadProject]);

  const project = currentProject;

  const projectName =
    (project as ProjectProps | undefined)?.name || "Untitled Project";
  const [editableName, setEditableName] = useState(projectName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isNameDirty, setIsNameDirty] = useState(false);

  useEffect(() => {
    if (!isNameDirty) {
      setEditableName(projectName);
    }
  }, [isNameDirty, projectName]);

  const [content, setContent] = useState<string>("");
  const editorRef = useRef<{ editor: TiptapEditor | null }>(null);
  const [editorReady, setEditorReady] = useState(false);

  // Update content when project loads or changes
  useEffect(() => {
    if (!isLoadingProject && project?.content !== undefined) {
      setContent(project.content);
    }
  }, [project?.content, isLoadingProject]);

  useEffect(() => {
    if (project?.id !== id) {
      setContent("");
    }
    editorRef.current = null;
    setEditorReady(false);
  }, [id, project?.id]);

  // Show loading state
  if (isLoadingProject) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-2xl space-y-4 px-6">
          <div className="h-8 w-48 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-background)]" />
          <div className="h-4 w-32 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-background)]" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-[var(--color-surface-background)]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--color-surface-background)]" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-[var(--color-surface-background)]" />
          </div>
        </div>
      </div>
    );
  }

  const saveProjectName = async () => {
    if (!token || !id || isSavingName) return;
    const trimmedName = editableName.trim();
    if (!trimmedName) {
      setEditableName(projectName);
      setIsNameDirty(false);
      return;
    }
    if (trimmedName === projectName) {
      setIsNameDirty(false);
      return;
    }

    setIsSavingName(true);
    try {
      await apiClient.put(`${API_BASE_URL}/v2/projects/${id}`, {
        name: trimmedName,
      });
      setIsNameDirty(false);
      if (project) {
        setCurrentProject({ ...project, name: trimmedName });
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to update project name.";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      }
      toast.error(errorMessage);
      setEditableName(projectName);
      setIsNameDirty(false);
    } finally {
      setIsSavingName(false);
    }
  };

  const displayProjectName = editableName.trim() || projectName;

  return (
    <>
      <DeleteProjectModal
        isOpen={showDeleteModal}
        projectName={displayProjectName}
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
      <div className="relative">
        <div className="mt-2">
          <div className="relative flex flex-col gap-7 bg-[var(--color-surface-background)] lg:flex-row">
            {!focusMode && (
              <DefaultAssistant
                projectId={id as string}
                content={content}
                editorRef={editorRef}
                editorReady={editorReady}
                postId={id as string}
              />
            )}

            {/* Editor (takes remaining space) */}

            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="relative w-full max-w-80">
                  <input
                    type="text"
                    value={editableName}
                    onChange={e => {
                      setEditableName(e.target.value);
                      setIsNameDirty(true);
                    }}
                    onBlur={saveProjectName}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] px-3 py-2 pr-10 text-sm text-[var(--color-text-primary)] shadow-sm focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none"
                    aria-label="Project name"
                  />
                  <button
                    type="button"
                    onClick={saveProjectName}
                    disabled={isSavingName || !isNameDirty}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-[var(--color-text-tertiary)] transition hover:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Save project name"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <span
                  className={`text-xs text-[var(--color-text-tertiary)] transition-opacity duration-300 ${isSavingName ? "opacity-100" : "opacity-0"}`}
                >
                  Saving...
                </span>
                <div
                  className="ml-auto flex items-center gap-0.5"
                  data-tour="editor-toolbar"
                >
                  <Tooltip text="Delete project">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="rounded p-1.5 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-error-container)] hover:text-[var(--color-error)]"
                      aria-label="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Search (Ctrl+F)">
                    <button
                      type="button"
                      onClick={() => setShowSearch(prev => !prev)}
                      className={`rounded p-1.5 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-background)] hover:text-[var(--color-text-secondary)] ${showSearch ? "bg-[var(--color-surface-background)] text-[var(--color-text-secondary)]" : ""}`}
                      aria-label="Toggle search"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip text={focusMode ? "Exit Focus" : "Focus Mode"}>
                    <button
                      type="button"
                      onClick={() => setFocusMode(prev => !prev)}
                      className={`rounded p-1.5 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-background)] hover:text-[var(--color-text-secondary)] ${focusMode ? "bg-[var(--color-surface-background)] text-[var(--color-text-secondary)]" : ""}`}
                      aria-label="Toggle focus mode"
                    >
                      {focusMode ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div data-tour="editor-area">
                <Editor
                  key={id as string}
                  ref={editorRef}
                  projectId={id as string}
                  content={content}
                  setContent={setContent}
                  projectName={displayProjectName}
                  focusMode={focusMode}
                  onFocusModeChange={setFocusMode}
                  showSearch={showSearch}
                  onShowSearchChange={setShowSearch}
                  onEditorReady={() => setEditorReady(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectEditorWrapper;

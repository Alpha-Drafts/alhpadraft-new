import React from "react";
import { ProjectProps } from "@/types";
import { userRoutes } from "@/constants";
import { formatUnderscoreDateToDate, getProjectRedirectUrl } from "@/utils";
import { useProject } from "@/context";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export const ProjectCard: React.FC<{
  project: ProjectProps;
  forceDraftLink?: boolean;
  onDelete?: (project: ProjectProps) => void;
}> = ({ project, forceDraftLink = true, onDelete }) => {
  const { setCurrentProject } = useProject();
  const redirectUrl = forceDraftLink
    ? `${userRoutes?.project_draft}/${project?.id}`
    : getProjectRedirectUrl(project?.stage || 0, project?.id);

  const lastUpdated = formatUnderscoreDateToDate(project?.updatedAt);

  const handleClick = () => {
    setCurrentProject(project);
  };

  return (
    <div className="group relative">
      <Link
        href={redirectUrl}
        onClick={handleClick}
        className="block border border-[var(--color-border-subtle)] bg-[var(--color-surface-container)] p-6 transition-[var(--transition-standard)] hover:-translate-y-0.5 hover:border-[var(--color-border-medium)] hover:shadow-[var(--elevation-1)]"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <h3
          className="pr-6 font-semibold text-[var(--color-text-primary)]"
          style={{ fontSize: "1rem", lineHeight: "24px" }}
        >
          {project?.name}
        </h3>
        <div className="mt-3 h-1 w-12 rounded-full bg-[var(--color-primary)] opacity-70 transition-opacity group-hover:opacity-100" />
        {lastUpdated && (
          <span
            className="mt-2 block uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]"
            style={{ fontSize: "0.75rem", lineHeight: "16px", fontWeight: 600 }}
          >
            Updated {lastUpdated}
          </span>
        )}
      </Link>

      {onDelete && (
        <button
          type="button"
          aria-label="Delete project"
          onClick={e => {
            e.stopPropagation();
            onDelete(project);
          }}
          className="absolute top-3 right-3 rounded-md p-1 text-[var(--color-text-tertiary)] opacity-0 transition-[var(--transition-fast)] group-hover:opacity-100 hover:bg-[var(--color-error-container)] hover:text-[var(--color-error)]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

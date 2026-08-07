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
        className="block rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
      >
        <h3 className="pr-6 text-base font-semibold text-slate-900">
          {project?.name}
        </h3>
        <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-violet-500 to-sky-500 opacity-70 transition-opacity group-hover:opacity-100" />
        {lastUpdated && (
          <span className="mt-1.5 block text-[10px] tracking-wide text-slate-400 uppercase">
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
          className="absolute top-3 right-3 rounded-md p-1 text-slate-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

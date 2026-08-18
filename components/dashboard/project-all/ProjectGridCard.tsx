import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, FileText, Trash2 } from "lucide-react";
import { ProjectProps } from "@/types";
import { userRoutes } from "@/constants";
import { formatUnderscoreDateToDate, getProjectRedirectUrl } from "@/utils";
import { useProject } from "@/context";

interface ProjectGridCardProps {
  project: ProjectProps;
  forceDraftLink?: boolean;
  onDelete?: (project: ProjectProps) => void;
}

export const ProjectGridCard: React.FC<ProjectGridCardProps> = ({
  project,
  forceDraftLink = true,
  onDelete,
}) => {
  const { setCurrentProject } = useProject();

  const redirectUrl = forceDraftLink
    ? `${userRoutes?.project_draft}/${project?.id}`
    : getProjectRedirectUrl(project?.stage || 0, project?.id);

  const lastUpdated = formatUnderscoreDateToDate(project?.updatedAt);
  const status = project?.status || "draft";
  const projectType = project?.type?.replace(/_/g, " ") || "document";

  const getStatusBadgeStyle = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "draft":
        return "bg-sky-50 text-sky-700 border-sky-200/80";
      case "in_progress":
      case "analysing":
      case "reviewing":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleClick = () => {
    setCurrentProject(project);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
      <div>
        {/* Top Badges & Delete Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Pill (999px radius) */}
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide ${getStatusBadgeStyle(
                status,
              )}`}
            >
              {status.replace(/_/g, " ")}
            </span>

            {/* Project Type Pill */}
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
              {projectType}
            </span>
          </div>

          {onDelete && (
            <button
              type="button"
              aria-label={`Delete ${project?.name || "project"}`}
              title="Delete project"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(project);
              }}
              className="rounded-lg p-1.5 text-slate-400 opacity-80 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Project Link & Info */}
        <Link
          href={redirectUrl}
          onClick={handleClick}
          className="mt-4 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8] focus-visible:ring-offset-2"
        >
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[#1A73E8]" />
            <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-[#1A73E8] sm:text-lg">
              {project?.name || "Untitled Project"}
            </h3>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {project?.description || "No project description provided."}
          </p>
        </Link>
      </div>

      {/* Footer Details */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{lastUpdated ? `Updated ${lastUpdated}` : "Recently updated"}</span>
        </div>

        <Link
          href={redirectUrl}
          onClick={handleClick}
          tabIndex={-1}
          className="inline-flex items-center gap-1 font-medium text-slate-500 transition-colors group-hover:text-[#1A73E8]"
        >
          <span>Open</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectGridCard;

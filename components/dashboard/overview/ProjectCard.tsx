import React, { useRef, useState, useCallback } from "react";
import { ProjectProps } from "@/types";
import { userRoutes } from "@/constants";
import { formatUnderscoreDateToDate, getProjectRedirectUrl } from "@/utils";
import { useProject } from "@/context";
import Link from "next/link";
import { Trash2, FileText } from "lucide-react";

export const ProjectCard: React.FC<{
  project: ProjectProps;
  forceDraftLink?: boolean;
  onDelete?: (project: ProjectProps) => void;
}> = ({ project, forceDraftLink = true, onDelete }) => {
  const { setCurrentProject } = useProject();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const redirectUrl = forceDraftLink
    ? `${userRoutes?.project_draft}/${project?.id}`
    : getProjectRedirectUrl(project?.stage || 0, project?.id);

  const lastUpdated = formatUnderscoreDateToDate(project?.updatedAt);

  const handleClick = () => {
    setCurrentProject(project);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -8,
      y: (x - 0.5) * 8,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <div className="group perspective-container" ref={cardRef}>
      <Link
        href={redirectUrl}
        onClick={handleClick}
        className="block relative overflow-hidden rounded-[var(--radius-card)] transition-[var(--transition-premium)]"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--glass-border)",
          boxShadow: isHovered ? "var(--elevation-2)" : "var(--elevation-1)",
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)"}`,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Subtle gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: "linear-gradient(135deg, rgba(26, 115, 232, 0.04) 0%, transparent 60%)",
          }}
        />

        {/* Shimmer line at top */}
        <div
          className="absolute top-0 left-0 h-[2px] w-full transition-all duration-500"
          style={{
            background: isHovered
              ? "linear-gradient(90deg, transparent 0%, var(--color-primary) 50%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, var(--color-border-subtle) 50%, transparent 100%)",
          }}
        />

        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]" style={{ background: "var(--color-primary-container)" }}>
              <FileText className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
            </div>
            <span
              className="badge-primary"
              style={{ fontSize: "0.65rem", padding: "2px 8px" }}
            >
              Draft
            </span>
          </div>

          <h3
            className="mt-4 font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-primary)]"
            style={{ fontSize: "1rem", lineHeight: "24px" }}
          >
            {project?.name}
          </h3>

          <div className="mt-3 h-1 w-12 rounded-full bg-[var(--color-primary)] opacity-40 transition-all duration-500 group-hover:w-20 group-hover:opacity-100" />

          {lastUpdated && (
            <span
              className="mt-3 block uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]"
              style={{ fontSize: "0.7rem", lineHeight: "16px", fontWeight: 600 }}
            >
              Updated {lastUpdated}
            </span>
          )}
        </div>
      </Link>

      {onDelete && (
        <button
          type="button"
          aria-label="Delete project"
          onClick={e => {
            e.stopPropagation();
            onDelete(project);
          }}
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-text-tertiary)] opacity-0 transition-[var(--transition-premium)] group-hover:opacity-100 hover:bg-[var(--color-error-container)] hover:text-[var(--color-error)]"
          style={{
            background: isHovered ? "var(--glass-bg-heavy)" : "transparent",
            backdropFilter: isHovered ? "blur(8px)" : "none",
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

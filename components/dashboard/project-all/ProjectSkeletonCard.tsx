import React from "react";

export const ProjectSkeletonCard: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
    >
      <div>
        {/* Top badges & action placeholder */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="h-6 w-6 animate-pulse rounded-md bg-slate-100" />
        </div>

        {/* Title placeholder */}
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded-md bg-slate-200" />

        {/* Description placeholder */}
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded-md bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
        </div>
      </div>

      {/* Footer placeholder */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="h-4 w-28 animate-pulse rounded-md bg-slate-100" />
        <div className="h-4 w-12 animate-pulse rounded-md bg-slate-100" />
      </div>
    </div>
  );
};

export default ProjectSkeletonCard;

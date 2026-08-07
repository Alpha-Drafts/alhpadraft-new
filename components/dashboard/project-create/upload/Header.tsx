import { ProjectProps } from "@/types";
import {
  formatUnderscoreDateToDate,
  getStatusBgColor,
  getStatusBorderColor,
  getStatusColor,
  isDateOverdue,
} from "@/utils";
import React from "react";

const Header = ({ project }: { project: ProjectProps }) => {
  const dueDateString = formatUnderscoreDateToDate(project?.dueDate || "");
  const isOverdue = isDateOverdue(dueDateString, project?.status || "");

  return (
    <header className="mt-14 mb-10 flex w-full flex-col gap-1 gap-x-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-body-semibold-14 mb-1 text-[#0A0A0A] capitalize">
          Project Name
        </p>
        <h1 className="text-sm text-[#717182]">{project?.name}</h1>
      </div>

      <div className="flex flex-col-reverse items-start gap-y-1 sm:flex-col sm:items-end">
        <p
          aria-label="Project Type"
          className={`${getStatusColor(project?.type)} ${getStatusBgColor(project?.type)} ${getStatusBorderColor(project?.type)} mb-1 inline-block rounded-md border px-2 py-0.5 text-sm capitalize`}
        >
          {project?.type?.replace(/_/g, " ")}
        </p>
        <p
          className={`${isOverdue ? "text-red-600" : "text-gray-500"} text-right text-sm text-[#717182]`}
        >
          Due: {dueDateString ? dueDateString : "No due date"}
        </p>
      </div>
    </header>
  );
};

export default Header;

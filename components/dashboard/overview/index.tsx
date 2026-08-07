import { useCurrentUser } from "@/hooks";
import VerificationStart from "./VerificationStart";
import RecentProjects from "./RecentProjects";
import { ShieldCheck } from "lucide-react";

const DashboardContent = () => {
  const { currentUser } = useCurrentUser();

  return (
    <div className="dashboard-content">
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        Welcome back, {currentUser?.displayName || "User"}!
      </h1>
      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-700">
        <ShieldCheck className="h-4 w-4" />
        Check the Integrity of your Work
      </div>
      <p className="text-body-regular-14 mt-[2px] text-gray-500">
        Select checks, upload your work, and submit for review.
      </p>
      <VerificationStart />
      <RecentProjects />
    </div>
  );
};

export default DashboardContent;

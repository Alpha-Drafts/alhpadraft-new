import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingTabProps {
  message: string;
}

const LoadingTab: React.FC<LoadingTabProps> = ({ message }) => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary-600 mx-auto h-8 w-8 animate-spin" />
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
};

export default LoadingTab;

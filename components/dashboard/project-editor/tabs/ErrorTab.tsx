import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorTabProps {
  errorMessage: string;
  children?: React.ReactNode;
}

const ErrorTab: React.FC<ErrorTabProps> = ({ errorMessage, children }) => {
  return (
    <div className="flex-1 p-4">
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{errorMessage}</p>
            {children ? <div className="mt-3">{children}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTab;

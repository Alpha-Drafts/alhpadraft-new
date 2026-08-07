import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CREDIT_HISTORY_ITEMS_PER_PAGE } from "@/hooks";
import { formatCredits } from "@/utils";
import { CreditTransactionProps } from "@/types";

interface CreditTransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CreditTransactionProps[];
  totalCount: number;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Extracts and formats all text containing "_ONLY" pattern while preserving the rest of the text
 * @param description - The description text to search in
 * @returns Formatted text with "_ONLY" patterns formatted properly or original text if not found
 * @example
 * Input: "Check for project project-1770560652019 using features: AI_ONLY, ALIGNMENT_ONLY, PLAGIARISM_ONLY"
 * Output: "Check for project project-1770560652019 using features: Ai, Alignment, and Plagiarism"
 */
const extractAndFormatOnlyText = (description: string): string => {
  const matches = description.match(/([A-Z_]+_ONLY)/g);
  if (!matches) return description;

  let result = description;

  // Convert all matches to formatted text
  const formattedItems = matches.map(match =>
    match
      .split("_")
      .filter(word => word !== "ONLY")
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" "),
  );

  // Join with commas and add "and" before the last item
  let formattedText: string;
  if (formattedItems.length === 1) {
    formattedText = formattedItems[0];
  } else if (formattedItems.length === 2) {
    formattedText = `${formattedItems[0]} and ${formattedItems[1]}`;
  } else {
    const allButLast = formattedItems.slice(0, -1).join(", ");
    formattedText = `${allButLast}, and ${formattedItems[formattedItems.length - 1]}`;
  }

  // Replace the entire sequence of matches with the formatted text
  const matchesPattern = matches
    .map(m => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[,\\s]*");
  result = result.replace(new RegExp(matchesPattern), formattedText);

  return result;
};

const CreditTransactionHistoryModal: React.FC<
  CreditTransactionHistoryModalProps
> = ({
  isOpen,
  onClose,
  data: creditHistory,
  totalCount: creditTotalCount,
  isLoading,
  currentPage,
  onPageChange,
}) => {
  const itemsPerPage = CREDIT_HISTORY_ITEMS_PER_PAGE;
  const totalPages =
    creditTotalCount > 0 ? Math.ceil(creditTotalCount / itemsPerPage) : 0;

  const goToNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        {isLoading ? (
          <div className="animate-pulse">
            <div className="mb-4 h-6 w-1/3 rounded bg-gray-200" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 rounded bg-gray-200" />
              ))}
            </div>
          </div>
        ) : creditTotalCount === 0 ? (
          <div className="text-center">
            <h4 className="text-body-medium-14 mb-3 text-black">
              Transaction History
            </h4>
            <p className="text-body-regular-12 text-gray-500">
              No credit transactions yet.
            </p>
          </div>
        ) : (
          <>
            <h4 className="text-body-medium-14 mb-[21px] text-black">
              Transaction History
            </h4>
            <ul className="text-body-regular-12 space-y-3">
              {creditHistory.map(item => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                >
                  <div>
                    <p className="text-body-medium-12 text-black">
                      {extractAndFormatOnlyText(item.description)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-body-medium-12 ${
                      item.type === "usage" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {item.type === "usage" ? "-" : "+"}
                    {formatCredits(Math.abs(item.amount))}
                  </span>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    goToPreviousPage();
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-body-regular-12 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    goToNextPage();
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreditTransactionHistoryModal;

import React, { useState } from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = "top",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Determine tooltip position styles
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-1";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-1";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-1";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-1";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-1";
    }
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {isVisible && (
        <div
          className={`pointer-events-none absolute z-50 max-w-[min(200px,90vw)] rounded bg-gray-800 px-2 py-1 text-xs text-white ${getPositionStyles()}`}
        >
          {text}
        </div>
      )}
      {children}
    </div>
  );
};

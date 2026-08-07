import { PositionType } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Props for the SliderButton component
 * @typedef {Object} SliderButtonProps
 * @property {(direction: PositionType) => void} scroll - Function to handle scrolling in either direction
 */
type SliderButtonProps = {
  scroll: (direction: PositionType) => void;
};

/**
 * A component that renders a pair of buttons for horizontal scrolling navigation
 * Typically used in carousels or horizontal scrollable content
 * @param {Function} scroll - Callback function to handle scroll direction
 */
const SliderButton = ({ scroll }: SliderButtonProps) => {
  return (
    <div className="space-x-4 lg:space-x-5">
      {/* Left scroll button */}
      <button
        onClick={() => scroll("left")}
        className="border-primary-500 focus:ring-primary-500 aspect-square rounded-full border p-2.5 focus:ring-2 focus:outline-none"
        aria-label="Scroll left"
      >
        <ChevronLeft size="24" className="text-primary-500" />
      </button>

      {/* Right scroll button */}
      <button
        onClick={() => scroll("right")}
        className="border-primary-500 focus:ring-primary-500 aspect-square rounded-full border p-2.5 focus:ring-2 focus:outline-none"
        aria-label="Scroll right"
      >
        <ChevronRight size="24" className="text-primary-500" />
      </button>
    </div>
  );
};

export default SliderButton;

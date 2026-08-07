import React from "react";
import Link from "next/link";
import { publicRoutes } from "@/constants";
import { ChevronRight } from "lucide-react";

export const Banner = () => {
  return (
    <Link
      className="dark:text-primary group block bg-neutral-50 p-4 text-center transition duration-300 focus:bg-gray-100 focus:outline-none dark:bg-neutral-700"
      href={publicRoutes?.home || "/"}
    >
      <div className="mx-auto max-w-[85rem] px-4 lg:px-6 xl:px-8">
        <p className="me-2 inline-block text-sm">
          Shop for everyone on your list with the Preline Guide.
        </p>
        <span className="dark:text-secondary-light text-secondary inline-flex items-center justify-center gap-x-2 text-sm font-semibold decoration-2 transition-all duration-300 group-hover:gap-x-3 group-hover:underline group-focus:underline">
          Shop now
          <ChevronRight className="size-4 shrink-0" />
        </span>
      </div>
    </Link>
  );
};

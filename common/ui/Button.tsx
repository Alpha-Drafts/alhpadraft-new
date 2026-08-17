import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { ButtonProps } from "@/types";

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "py-2 px-3 text-xs",
  md: "py-3 px-4 text-sm",
  lg: "py-4 px-6 text-base",
};

const roundedClasses: Record<NonNullable<ButtonProps["rounded"]>, string> = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full aspect-square",
};

const baseClasses =
  "inline-flex items-center gap-x-2 font-medium transition-all disabled:opacity-50 disabled:pointer-events-none group";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-none text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A]",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  outline:
    "border border-blue-600 text-blue-600 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  plain:
    "border border-transparent text-slate-700 hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  danger:
    "border border-transparent bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
  link: "border border-transparent !p-0 text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
};

export function Button({
  text,
  id,
  type = "button",
  className = "",
  onClick,
  disabled = false,
  hidden = false,
  children,
  link,
  title,
  icon,
  iconPosition = "left",
  variant = "primary",
  size = "md",
  rounded = "md",
  ...props
}: ButtonProps) {
  if (hidden) return null;

  const content = (
    <span
      className={`mx-auto ${icon ? "inline-flex items-center justify-center gap-1 whitespace-nowrap transition-all" : ""}`}
    >
      {icon && iconPosition === "left" && (
        <span className={children ? "mr-2" : ""}>{icon}</span>
      )}
      {text ?? children}
      {icon && iconPosition === "right" && (
        <span className={children ? "ml-2" : ""}>{icon}</span>
      )}
    </span>
  );

  const buttonClass = clsx(
    baseClasses,
    sizeClasses[size || "md"],
    roundedClasses[rounded || "md"],
    variantClasses[variant],
    className,
  );

  const customStyle =
    variant === "primary"
      ? {
          background:
            "linear-gradient(109.37deg, #1A73E8 0%, #1557B0 50%, #10438C 100%)",
        }
      : {};

  if (link) {
    return (
      <Link
        href={link}
        id={id}
        className={buttonClass}
        style={customStyle}
        title={title}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
      style={customStyle}
      title={title}
      {...props}
    >
      {content}
    </button>
  );
}
